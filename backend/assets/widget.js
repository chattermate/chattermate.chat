var cd = Object.defineProperty;
var ud = (e, t, n) => t in e ? cd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Fe = (e, t, n) => ud(e, typeof t != "symbol" ? t + "" : t, n);
function xa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Be = {}, Qs = [], bn = () => {
}, pd = () => !1, Qo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Sa = (e) => e.startsWith("onUpdate:"), bt = Object.assign, Ta = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, dd = Object.prototype.hasOwnProperty, Ie = (e, t) => dd.call(e, t), pe = Array.isArray, Xs = (e) => Xo(e) === "[object Map]", Wc = (e) => Xo(e) === "[object Set]", me = (e) => typeof e == "function", Je = (e) => typeof e == "string", ds = (e) => typeof e == "symbol", Ue = (e) => e !== null && typeof e == "object", Kc = (e) => (Ue(e) || me(e)) && me(e.then) && me(e.catch), Gc = Object.prototype.toString, Xo = (e) => Gc.call(e), hd = (e) => Xo(e).slice(8, -1), Yc = (e) => Xo(e) === "[object Object]", Aa = (e) => Je(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Rr = xa(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), ei = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, fd = /-(\w)/g, cs = ei((e) => e.replace(fd, (t, n) => n ? n.toUpperCase() : "")), md = /\B([A-Z])/g, hs = ei((e) => e.replace(md, "-$1").toLowerCase()), Zc = ei((e) => e.charAt(0).toUpperCase() + e.slice(1)), Ai = ei((e) => e ? `on${Zc(e)}` : ""), is = (e, t) => !Object.is(e, t), _o = (e, ...t) => {
  for (let n = 0; n < e.length; n++) e[n](...t);
}, Zi = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, { configurable: !0, enumerable: !1, writable: s, value: n });
}, Ji = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ol;
const Po = () => Ol || (Ol = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function fe(e) {
  if (pe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = Je(s) ? bd(s) : fe(s);
      if (r) for (const o in r) t[o] = r[o];
    }
    return t;
  } else if (Je(e) || Ue(e)) return e;
}
const gd = /;(?![^(]*\))/g, vd = /:([^]+)/, yd = /\/\*[^]*?\*\//g;
function bd(e) {
  const t = {};
  return e.replace(yd, "").split(gd).forEach((n) => {
    if (n) {
      const s = n.split(vd);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function _e(e) {
  let t = "";
  if (Je(e)) t = e;
  else if (pe(e)) for (let n = 0; n < e.length; n++) {
    const s = _e(e[n]);
    s && (t += s + " ");
  }
  else if (Ue(e)) for (const n in e) e[n] && (t += n + " ");
  return t.trim();
}
const _d = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", wd = xa(_d);
function Jc(e) {
  return !!e || e === "";
}
const Qc = (e) => !!(e && e.__v_isRef === !0), q = (e) => Je(e) ? e : e == null ? "" : pe(e) || Ue(e) && (e.toString === Gc || !me(e.toString)) ? Qc(e) ? q(e.value) : JSON.stringify(e, Xc, 2) : String(e), Xc = (e, t) => Qc(t) ? Xc(e, t.value) : Xs(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((n, [s, r], o) => (n[Ci(s, o) + " =>"] = r, n), {}) } : Wc(t) ? { [`Set(${t.size})`]: [...t.values()].map((n) => Ci(n)) } : ds(t) ? Ci(t) : Ue(t) && !pe(t) && !Yc(t) ? String(t) : t, Ci = (e, t = "") => {
  var n;
  return ds(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e;
};
let Ot;
class kd {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Ot, !t && Ot && (this.index = (Ot.scopes || (Ot.scopes = [])).push(this) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes) for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].pause();
    }
  }
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes) for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = Ot;
      try {
        return Ot = this, t();
      } finally {
        Ot = n;
      }
    }
  }
  on() {
    ++this._on === 1 && (this.prevScope = Ot, Ot = this);
  }
  off() {
    this._on > 0 && --this._on === 0 && (Ot = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, s;
      for (n = 0, s = this.effects.length; n < s; n++) this.effects[n].stop();
      for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++) this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, s = this.scopes.length; n < s; n++) this.scopes[n].stop(!0);
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
function xd() {
  return Ot;
}
let ze;
const Ei = /* @__PURE__ */ new WeakSet();
class eu {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ot && Ot.active && Ot.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ei.has(this) && (Ei.delete(this), this.trigger()));
  }
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || nu(this);
  }
  run() {
    if (!(this.flags & 1)) return this.fn();
    this.flags |= 2, Il(this), su(this);
    const t = ze, n = on;
    ze = this, on = !0;
    try {
      return this.fn();
    } finally {
      ru(this), ze = t, on = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep) Ra(t);
      this.deps = this.depsTail = void 0, Il(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ei.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  runIfDirty() {
    Qi(this) && this.run();
  }
  get dirty() {
    return Qi(this);
  }
}
let tu = 0, Or, Ir;
function nu(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Ir, Ir = e;
    return;
  }
  e.next = Or, Or = e;
}
function Ca() {
  tu++;
}
function Ea() {
  if (--tu > 0) return;
  if (Ir) {
    let t = Ir;
    for (Ir = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Or; ) {
    let t = Or;
    for (Or = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
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
  for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ru(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ra(s), Sd(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Qi(e) {
  for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (ou(t.dep.computed) || t.dep.version !== t.version)) return !0;
  return !!e._dirty;
}
function ou(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Br) || (e.globalVersion = Br, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Qi(e)))) return;
  e.flags |= 2;
  const t = e.dep, n = ze, s = on;
  ze = e, on = !0;
  try {
    su(e);
    const r = e.fn(e._value);
    (t.version === 0 || is(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    ze = n, on = s, ru(e), e.flags &= -3;
  }
}
function Ra(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let o = n.computed.deps; o; o = o.nextDep) Ra(o, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Sd(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let on = !0;
const iu = [];
function Fn() {
  iu.push(on), on = !1;
}
function Bn() {
  const e = iu.pop();
  on = e === void 0 ? !0 : e;
}
function Il(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = ze;
    ze = void 0;
    try {
      t();
    } finally {
      ze = n;
    }
  }
}
let Br = 0;
class Td {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Oa {
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!ze || !on || ze === this.computed) return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== ze) n = this.activeLink = new Td(ze, this), ze.deps ? (n.prevDep = ze.depsTail, ze.depsTail.nextDep = n, ze.depsTail = n) : ze.deps = ze.depsTail = n, au(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = ze.depsTail, n.nextDep = void 0, ze.depsTail.nextDep = n, ze.depsTail = n, ze.deps === n && (ze.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Br++, this.notify(t);
  }
  notify(t) {
    Ca();
    try {
      for (let n = this.subs; n; n = n.prevSub) n.sub.notify() && n.sub.dep.notify();
    } finally {
      Ea();
    }
  }
}
function au(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep) au(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Xi = /* @__PURE__ */ new WeakMap(), Ns = Symbol(""), ea = Symbol(""), zr = Symbol("");
function vt(e, t, n) {
  if (on && ze) {
    let s = Xi.get(e);
    s || Xi.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Oa()), r.map = s, r.key = n), r.track();
  }
}
function Nn(e, t, n, s, r, o) {
  const i = Xi.get(e);
  if (!i) {
    Br++;
    return;
  }
  const a = (l) => {
    l && l.trigger();
  };
  if (Ca(), t === "clear") i.forEach(a);
  else {
    const l = pe(e), c = l && Aa(n);
    if (l && n === "length") {
      const d = Number(s);
      i.forEach((_, w) => {
        (w === "length" || w === zr || !ds(w) && w >= d) && a(_);
      });
    } else switch ((n !== void 0 || i.has(void 0)) && a(i.get(n)), c && a(i.get(zr)), t) {
      case "add":
        l ? c && a(i.get("length")) : (a(i.get(Ns)), Xs(e) && a(i.get(ea)));
        break;
      case "delete":
        l || (a(i.get(Ns)), Xs(e) && a(i.get(ea)));
        break;
      case "set":
        Xs(e) && a(i.get(Ns));
        break;
    }
  }
  Ea();
}
function Ks(e) {
  const t = we(e);
  return t === e ? t : (vt(t, "iterate", zr), Qt(e) ? t : t.map(ht));
}
function ti(e) {
  return vt(e = we(e), "iterate", zr), e;
}
const Ad = { __proto__: null, [Symbol.iterator]() {
  return Ri(this, Symbol.iterator, ht);
}, concat(...e) {
  return Ks(this).concat(...e.map((t) => pe(t) ? Ks(t) : t));
}, entries() {
  return Ri(this, "entries", (e) => (e[1] = ht(e[1]), e));
}, every(e, t) {
  return Rn(this, "every", e, t, void 0, arguments);
}, filter(e, t) {
  return Rn(this, "filter", e, t, (n) => n.map(ht), arguments);
}, find(e, t) {
  return Rn(this, "find", e, t, ht, arguments);
}, findIndex(e, t) {
  return Rn(this, "findIndex", e, t, void 0, arguments);
}, findLast(e, t) {
  return Rn(this, "findLast", e, t, ht, arguments);
}, findLastIndex(e, t) {
  return Rn(this, "findLastIndex", e, t, void 0, arguments);
}, forEach(e, t) {
  return Rn(this, "forEach", e, t, void 0, arguments);
}, includes(...e) {
  return Oi(this, "includes", e);
}, indexOf(...e) {
  return Oi(this, "indexOf", e);
}, join(e) {
  return Ks(this).join(e);
}, lastIndexOf(...e) {
  return Oi(this, "lastIndexOf", e);
}, map(e, t) {
  return Rn(this, "map", e, t, void 0, arguments);
}, pop() {
  return fr(this, "pop");
}, push(...e) {
  return fr(this, "push", e);
}, reduce(e, ...t) {
  return Ll(this, "reduce", e, t);
}, reduceRight(e, ...t) {
  return Ll(this, "reduceRight", e, t);
}, shift() {
  return fr(this, "shift");
}, some(e, t) {
  return Rn(this, "some", e, t, void 0, arguments);
}, splice(...e) {
  return fr(this, "splice", e);
}, toReversed() {
  return Ks(this).toReversed();
}, toSorted(e) {
  return Ks(this).toSorted(e);
}, toSpliced(...e) {
  return Ks(this).toSpliced(...e);
}, unshift(...e) {
  return fr(this, "unshift", e);
}, values() {
  return Ri(this, "values", ht);
} };
function Ri(e, t, n) {
  const s = ti(e), r = s[t]();
  return s !== e && !Qt(e) && (r._next = r.next, r.next = () => {
    const o = r._next();
    return o.value && (o.value = n(o.value)), o;
  }), r;
}
const Cd = Array.prototype;
function Rn(e, t, n, s, r, o) {
  const i = ti(e), a = i !== e && !Qt(e), l = i[t];
  if (l !== Cd[t]) {
    const _ = l.apply(e, o);
    return a ? ht(_) : _;
  }
  let c = n;
  i !== e && (a ? c = function(_, w) {
    return n.call(this, ht(_), w, e);
  } : n.length > 2 && (c = function(_, w) {
    return n.call(this, _, w, e);
  }));
  const d = l.call(i, c, s);
  return a && r ? r(d) : d;
}
function Ll(e, t, n, s) {
  const r = ti(e);
  let o = n;
  return r !== e && (Qt(e) ? n.length > 3 && (o = function(i, a, l) {
    return n.call(this, i, a, l, e);
  }) : o = function(i, a, l) {
    return n.call(this, i, ht(a), l, e);
  }), r[t](o, ...s);
}
function Oi(e, t, n) {
  const s = we(e);
  vt(s, "iterate", zr);
  const r = s[t](...n);
  return (r === -1 || r === !1) && La(n[0]) ? (n[0] = we(n[0]), s[t](...n)) : r;
}
function fr(e, t, n = []) {
  Fn(), Ca();
  const s = we(e)[t].apply(e, n);
  return Ea(), Bn(), s;
}
const Ed = xa("__proto__,__v_isRef,__isVue"), lu = new Set(Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(ds));
function Rd(e) {
  ds(e) || (e = String(e));
  const t = we(this);
  return vt(t, "has", e), t.hasOwnProperty(e);
}
class cu {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, s) {
    if (n === "__v_skip") return t.__v_skip;
    const r = this._isReadonly, o = this._isShallow;
    if (n === "__v_isReactive") return !r;
    if (n === "__v_isReadonly") return r;
    if (n === "__v_isShallow") return o;
    if (n === "__v_raw") return s === (r ? o ? Bd : fu : o ? hu : du).get(t) || Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const i = pe(t);
    if (!r) {
      let l;
      if (i && (l = Ad[n])) return l;
      if (n === "hasOwnProperty") return Rd;
    }
    const a = Reflect.get(t, n, yt(t) ? t : s);
    return (ds(n) ? lu.has(n) : Ed(n)) || (r || vt(t, "get", n), o) ? a : yt(a) ? i && Aa(n) ? a : a.value : Ue(a) ? r ? mu(a) : qr(a) : a;
  }
}
class uu extends cu {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let o = t[n];
    if (!this._isShallow) {
      const l = us(o);
      if (!Qt(s) && !us(s) && (o = we(o), s = we(s)), !pe(t) && yt(o) && !yt(s)) return l ? !1 : (o.value = s, !0);
    }
    const i = pe(t) && Aa(n) ? Number(n) < t.length : Ie(t, n), a = Reflect.set(t, n, s, yt(t) ? t : r);
    return t === we(r) && (i ? is(s, o) && Nn(t, "set", n, s) : Nn(t, "add", n, s)), a;
  }
  deleteProperty(t, n) {
    const s = Ie(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Nn(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!ds(n) || !lu.has(n)) && vt(t, "has", n), s;
  }
  ownKeys(t) {
    return vt(t, "iterate", pe(t) ? "length" : Ns), Reflect.ownKeys(t);
  }
}
class pu extends cu {
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
const Od = new uu(), Id = new pu(), Ld = new uu(!0), gk = new pu(!0), ta = (e) => e, po = (e) => Reflect.getPrototypeOf(e);
function Nd(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, o = we(r), i = Xs(o), a = e === "entries" || e === Symbol.iterator && i, l = e === "keys" && i, c = r[e](...s), d = n ? ta : t ? Fo : ht;
    return !t && vt(o, "iterate", l ? ea : Ns), { next() {
      const { value: _, done: w } = c.next();
      return w ? { value: _, done: w } : { value: a ? [d(_[0]), d(_[1])] : d(_), done: w };
    }, [Symbol.iterator]() {
      return this;
    } };
  };
}
function ho(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Dd(e, t) {
  const n = { get(s) {
    const r = this.__v_raw, o = we(r), i = we(s);
    e || (is(s, i) && vt(o, "get", s), vt(o, "get", i));
    const { has: a } = po(o), l = t ? ta : e ? Fo : ht;
    if (a.call(o, s)) return l(r.get(s));
    if (a.call(o, i)) return l(r.get(i));
    r !== o && r.get(s);
  }, get size() {
    const s = this.__v_raw;
    return !e && vt(we(s), "iterate", Ns), Reflect.get(s, "size", s);
  }, has(s) {
    const r = this.__v_raw, o = we(r), i = we(s);
    return e || (is(s, i) && vt(o, "has", s), vt(o, "has", i)), s === i ? r.has(s) : r.has(s) || r.has(i);
  }, forEach(s, r) {
    const o = this, i = o.__v_raw, a = we(i), l = t ? ta : e ? Fo : ht;
    return !e && vt(a, "iterate", Ns), i.forEach((c, d) => s.call(r, l(c), l(d), o));
  } };
  return bt(n, e ? { add: ho("add"), set: ho("set"), delete: ho("delete"), clear: ho("clear") } : { add(s) {
    !t && !Qt(s) && !us(s) && (s = we(s));
    const r = we(this);
    return po(r).has.call(r, s) || (r.add(s), Nn(r, "add", s, s)), this;
  }, set(s, r) {
    !t && !Qt(r) && !us(r) && (r = we(r));
    const o = we(this), { has: i, get: a } = po(o);
    let l = i.call(o, s);
    l || (s = we(s), l = i.call(o, s));
    const c = a.call(o, s);
    return o.set(s, r), l ? is(r, c) && Nn(o, "set", s, r) : Nn(o, "add", s, r), this;
  }, delete(s) {
    const r = we(this), { has: o, get: i } = po(r);
    let a = o.call(r, s);
    a || (s = we(s), a = o.call(r, s)), i && i.call(r, s);
    const l = r.delete(s);
    return a && Nn(r, "delete", s, void 0), l;
  }, clear() {
    const s = we(this), r = s.size !== 0, o = s.clear();
    return r && Nn(s, "clear", void 0, void 0), o;
  } }), ["keys", "values", "entries", Symbol.iterator].forEach((s) => {
    n[s] = Nd(s, e, t);
  }), n;
}
function ni(e, t) {
  const n = Dd(e, t);
  return (s, r, o) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(Ie(n, r) && r in s ? n : s, r, o);
}
const $d = { get: ni(!1, !1) }, Pd = { get: ni(!1, !0) }, Fd = { get: ni(!0, !1) }, vk = { get: ni(!0, !0) }, du = /* @__PURE__ */ new WeakMap(), hu = /* @__PURE__ */ new WeakMap(), fu = /* @__PURE__ */ new WeakMap(), Bd = /* @__PURE__ */ new WeakMap();
function zd(e) {
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
function Md(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : zd(hd(e));
}
function qr(e) {
  return us(e) ? e : Ia(e, !1, Od, $d, du);
}
function Ud(e) {
  return Ia(e, !1, Ld, Pd, hu);
}
function mu(e) {
  return Ia(e, !0, Id, Fd, fu);
}
function Ia(e, t, n, s, r) {
  if (!Ue(e) || e.__v_raw && !(t && e.__v_isReactive)) return e;
  const o = Md(e);
  if (o === 0) return e;
  const i = r.get(e);
  if (i) return i;
  const a = new Proxy(e, o === 2 ? s : n);
  return r.set(e, a), a;
}
function er(e) {
  return us(e) ? er(e.__v_raw) : !!(e && e.__v_isReactive);
}
function us(e) {
  return !!(e && e.__v_isReadonly);
}
function Qt(e) {
  return !!(e && e.__v_isShallow);
}
function La(e) {
  return e ? !!e.__v_raw : !1;
}
function we(e) {
  const t = e && e.__v_raw;
  return t ? we(t) : e;
}
function jd(e) {
  return !Ie(e, "__v_skip") && Object.isExtensible(e) && Zi(e, "__v_skip", !0), e;
}
const ht = (e) => Ue(e) ? qr(e) : e, Fo = (e) => Ue(e) ? mu(e) : e;
function yt(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function te(e) {
  return gu(e, !1);
}
function qd(e) {
  return gu(e, !0);
}
function gu(e, t) {
  return yt(e) ? e : new Hd(e, t);
}
class Hd {
  constructor(t, n) {
    this.dep = new Oa(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : we(t), this._value = n ? t : ht(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || Qt(t) || us(t);
    t = s ? t : we(t), is(t, n) && (this._rawValue = t, this._value = s ? t : ht(t), this.dep.trigger());
  }
}
function S(e) {
  return yt(e) ? e.value : e;
}
const Vd = { get: (e, t, n) => t === "__v_raw" ? e : S(Reflect.get(e, t, n)), set: (e, t, n, s) => {
  const r = e[t];
  return yt(r) && !yt(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
} };
function vu(e) {
  return er(e) ? e : new Proxy(e, Vd);
}
class Wd {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Oa(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Br - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && ze !== this) return nu(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return ou(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Kd(e, t, n = !1) {
  let s, r;
  return me(e) ? s = e : (s = e.get, r = e.set), new Wd(s, r, n);
}
const fo = {}, Bo = /* @__PURE__ */ new WeakMap();
let Cs;
function Gd(e, t = !1, n = Cs) {
  if (n) {
    let s = Bo.get(n);
    s || Bo.set(n, s = []), s.push(e);
  }
}
function Yd(e, t, n = Be) {
  const { immediate: s, deep: r, once: o, scheduler: i, augmentJob: a, call: l } = n, c = (E) => r ? E : Qt(E) || r === !1 || r === 0 ? Dn(E, 1) : Dn(E);
  let d, _, w, k, C = !1, M = !1;
  if (yt(e) ? (_ = () => e.value, C = Qt(e)) : er(e) ? (_ = () => c(e), C = !0) : pe(e) ? (M = !0, C = e.some((E) => er(E) || Qt(E)), _ = () => e.map((E) => {
    if (yt(E)) return E.value;
    if (er(E)) return c(E);
    if (me(E)) return l ? l(E, 2) : E();
  })) : me(e) ? t ? _ = l ? () => l(e, 2) : e : _ = () => {
    if (w) {
      Fn();
      try {
        w();
      } finally {
        Bn();
      }
    }
    const E = Cs;
    Cs = d;
    try {
      return l ? l(e, 3, [k]) : e(k);
    } finally {
      Cs = E;
    }
  } : _ = bn, t && r) {
    const E = _, U = r === !0 ? 1 / 0 : r;
    _ = () => Dn(E(), U);
  }
  const K = xd(), x = () => {
    d.stop(), K && K.active && Ta(K.effects, d);
  };
  if (o && t) {
    const E = t;
    t = (...U) => {
      E(...U), x();
    };
  }
  let G = M ? new Array(e.length).fill(fo) : fo;
  const Z = (E) => {
    if (!(!(d.flags & 1) || !d.dirty && !E)) if (t) {
      const U = d.run();
      if (r || C || (M ? U.some((T, J) => is(T, G[J])) : is(U, G))) {
        w && w();
        const T = Cs;
        Cs = d;
        try {
          const J = [U, G === fo ? void 0 : M && G[0] === fo ? [] : G, k];
          G = U, l ? l(t, 3, J) : t(...J);
        } finally {
          Cs = T;
        }
      }
    } else d.run();
  };
  return a && a(Z), d = new eu(_), d.scheduler = i ? () => i(Z, !1) : Z, k = (E) => Gd(E, !1, d), w = d.onStop = () => {
    const E = Bo.get(d);
    if (E) {
      if (l) l(E, 4);
      else for (const U of E) U();
      Bo.delete(d);
    }
  }, t ? s ? Z(!0) : G = d.run() : i ? i(Z.bind(null, !0), !0) : d.run(), x.pause = d.pause.bind(d), x.resume = d.resume.bind(d), x.stop = x, x;
}
function Dn(e, t = 1 / 0, n) {
  if (t <= 0 || !Ue(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e))) return e;
  if (n.add(e), t--, yt(e)) Dn(e.value, t, n);
  else if (pe(e)) for (let s = 0; s < e.length; s++) Dn(e[s], t, n);
  else if (Wc(e) || Xs(e)) e.forEach((s) => {
    Dn(s, t, n);
  });
  else if (Yc(e)) {
    for (const s in e) Dn(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, s) && Dn(e[s], t, n);
  }
  return e;
}
function Hr(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    si(r, t, n);
  }
}
function wn(e, t, n, s) {
  if (me(e)) {
    const r = Hr(e, t, n, s);
    return r && Kc(r) && r.catch((o) => {
      si(o, t, n);
    }), r;
  }
  if (pe(e)) {
    const r = [];
    for (let o = 0; o < e.length; o++) r.push(wn(e[o], t, n, s));
    return r;
  }
}
function si(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: i } = t && t.appContext.config || Be;
  if (t) {
    let a = t.parent;
    const l = t.proxy, c = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const d = a.ec;
      if (d) {
        for (let _ = 0; _ < d.length; _++) if (d[_](e, l, c) === !1) return;
      }
      a = a.parent;
    }
    if (o) {
      Fn(), Hr(o, null, 10, [e, l, c]), Bn();
      return;
    }
  }
  Zd(e, n, r, s, i);
}
function Zd(e, t, n, s = !0, r = !1) {
  if (r) throw e;
  console.error(e);
}
const St = [];
let gn = -1;
const tr = [];
let ss = null, Gs = 0;
const yu = Promise.resolve();
let zo = null;
function os(e) {
  const t = zo || yu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Jd(e) {
  let t = gn + 1, n = St.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = St[s], o = Mr(r);
    o < e || o === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Na(e) {
  if (!(e.flags & 1)) {
    const t = Mr(e), n = St[St.length - 1];
    !n || !(e.flags & 2) && t >= Mr(n) ? St.push(e) : St.splice(Jd(t), 0, e), e.flags |= 1, bu();
  }
}
function bu() {
  zo || (zo = yu.then(wu));
}
function Qd(e) {
  pe(e) ? tr.push(...e) : ss && e.id === -1 ? ss.splice(Gs + 1, 0, e) : e.flags & 1 || (tr.push(e), e.flags |= 1), bu();
}
function Nl(e, t, n = gn + 1) {
  for (; n < St.length; n++) {
    const s = St[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid) continue;
      St.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function _u(e) {
  if (tr.length) {
    const t = [...new Set(tr)].sort((n, s) => Mr(n) - Mr(s));
    if (tr.length = 0, ss) {
      ss.push(...t);
      return;
    }
    for (ss = t, Gs = 0; Gs < ss.length; Gs++) {
      const n = ss[Gs];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    ss = null, Gs = 0;
  }
}
const Mr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function wu(e) {
  try {
    for (gn = 0; gn < St.length; gn++) {
      const t = St[gn];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Hr(t, t.i, t.i ? 15 : 14), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; gn < St.length; gn++) {
      const t = St[gn];
      t && (t.flags &= -2);
    }
    gn = -1, St.length = 0, _u(), zo = null, (St.length || tr.length) && wu();
  }
}
let Jt = null, ku = null;
function Mo(e) {
  const t = Jt;
  return Jt = e, ku = e && e.type.__scopeId || null, t;
}
function Xd(e, t = Jt, n) {
  if (!t || e._n) return e;
  const s = (...r) => {
    s._d && jl(-1);
    const o = Mo(t);
    let i;
    try {
      i = e(...r);
    } finally {
      Mo(o), s._d && jl(1);
    }
    return i;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function ts(e, t) {
  if (Jt === null) return e;
  const n = ci(Jt), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [o, i, a, l = Be] = t[r];
    o && (me(o) && (o = { mounted: o, updated: o }), o.deep && Dn(i), s.push({ dir: o, instance: n, value: i, oldValue: void 0, arg: a, modifiers: l }));
  }
  return e;
}
function xs(e, t, n, s) {
  const r = e.dirs, o = t && t.dirs;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    o && (a.oldValue = o[i].value);
    let l = a.dir[s];
    l && (Fn(), wn(l, n, 8, [e.el, a, e, t]), Bn());
  }
}
const eh = Symbol("_vte"), th = (e) => e.__isTeleport;
function Da(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Da(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function zn(e, t) {
  return me(e) ? bt({ name: e.name }, t, { setup: e }) : e;
}
function xu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Lr(e, t, n, s, r = !1) {
  if (pe(e)) {
    e.forEach((C, M) => Lr(C, t && (pe(t) ? t[M] : t), n, s, r));
    return;
  }
  if (Nr(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Lr(e, t, n, s.component.subTree);
    return;
  }
  const o = s.shapeFlag & 4 ? ci(s.component) : s.el, i = r ? null : o, { i: a, r: l } = e, c = t && t.r, d = a.refs === Be ? a.refs = {} : a.refs, _ = a.setupState, w = we(_), k = _ === Be ? () => !1 : (C) => Ie(w, C);
  if (c != null && c !== l && (Je(c) ? (d[c] = null, k(c) && (_[c] = null)) : yt(c) && (c.value = null)), me(l)) Hr(l, a, 12, [i, d]);
  else {
    const C = Je(l), M = yt(l);
    if (C || M) {
      const K = () => {
        if (e.f) {
          const x = C ? k(l) ? _[l] : d[l] : l.value;
          r ? pe(x) && Ta(x, o) : pe(x) ? x.includes(o) || x.push(o) : C ? (d[l] = [o], k(l) && (_[l] = d[l])) : (l.value = [o], e.k && (d[e.k] = l.value));
        } else C ? (d[l] = i, k(l) && (_[l] = i)) : M && (l.value = i, e.k && (d[e.k] = i));
      };
      i ? (K.id = -1, Bt(K, n)) : K();
    }
  }
}
Po().requestIdleCallback, Po().cancelIdleCallback;
const Nr = (e) => !!e.type.__asyncLoader, Su = (e) => e.type.__isKeepAlive;
function nh(e, t) {
  Tu(e, "a", t);
}
function sh(e, t) {
  Tu(e, "da", t);
}
function Tu(e, t, n = At) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated) return;
      r = r.parent;
    }
    return e();
  });
  if (ri(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; ) Su(r.parent.vnode) && rh(s, t, n, r), r = r.parent;
  }
}
function rh(e, t, n, s) {
  const r = ri(t, e, s, !0);
  Vr(() => {
    Ta(s[t], r);
  }, n);
}
function ri(e, t, n = At, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), o = t.__weh || (t.__weh = (...i) => {
      Fn();
      const a = Wr(n), l = wn(t, n, e, i);
      return a(), Bn(), l;
    });
    return s ? r.unshift(o) : r.push(o), o;
  }
}
const Mn = (e) => (t, n = At) => {
  (!jr || e === "sp") && ri(e, (...s) => t(...s), n);
}, oh = Mn("bm"), oi = Mn("m"), ih = Mn("bu"), ah = Mn("u"), ii = Mn("bum"), Vr = Mn("um"), lh = Mn("sp"), ch = Mn("rtg"), uh = Mn("rtc");
function ph(e, t = At) {
  ri("ec", e, t);
}
const dh = Symbol.for("v-ndc");
function Ve(e, t, n, s) {
  let r;
  const o = n, i = pe(e);
  if (i || Je(e)) {
    const a = i && er(e);
    let l = !1, c = !1;
    a && (l = !Qt(e), c = us(e), e = ti(e)), r = new Array(e.length);
    for (let d = 0, _ = e.length; d < _; d++) r[d] = t(l ? c ? Fo(ht(e[d])) : ht(e[d]) : e[d], d, void 0, o);
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let a = 0; a < e; a++) r[a] = t(a + 1, a, void 0, o);
  } else if (Ue(e)) if (e[Symbol.iterator]) r = Array.from(e, (a, l) => t(a, l, void 0, o));
  else {
    const a = Object.keys(e);
    r = new Array(a.length);
    for (let l = 0, c = a.length; l < c; l++) {
      const d = a[l];
      r[l] = t(e[d], d, l, o);
    }
  }
  else r = [];
  return r;
}
const na = (e) => e ? Wu(e) ? ci(e) : na(e.parent) : null, Dr = bt(/* @__PURE__ */ Object.create(null), { $: (e) => e, $el: (e) => e.vnode.el, $data: (e) => e.data, $props: (e) => e.props, $attrs: (e) => e.attrs, $slots: (e) => e.slots, $refs: (e) => e.refs, $parent: (e) => na(e.parent), $root: (e) => na(e.root), $host: (e) => e.ce, $emit: (e) => e.emit, $options: (e) => Cu(e), $forceUpdate: (e) => e.f || (e.f = () => {
  Na(e.update);
}), $nextTick: (e) => e.n || (e.n = os.bind(e.proxy)), $watch: (e) => Dh.bind(e) }), Ii = (e, t) => e !== Be && !e.__isScriptSetup && Ie(e, t), hh = { get({ _: e }, t) {
  if (t === "__v_skip") return !0;
  const { ctx: n, setupState: s, data: r, props: o, accessCache: i, type: a, appContext: l } = e;
  let c;
  if (t[0] !== "$") {
    const k = i[t];
    if (k !== void 0) switch (k) {
      case 1:
        return s[t];
      case 2:
        return r[t];
      case 4:
        return n[t];
      case 3:
        return o[t];
    }
    else {
      if (Ii(s, t)) return i[t] = 1, s[t];
      if (r !== Be && Ie(r, t)) return i[t] = 2, r[t];
      if ((c = e.propsOptions[0]) && Ie(c, t)) return i[t] = 3, o[t];
      if (n !== Be && Ie(n, t)) return i[t] = 4, n[t];
      sa && (i[t] = 0);
    }
  }
  const d = Dr[t];
  let _, w;
  if (d) return t === "$attrs" && vt(e.attrs, "get", ""), d(e);
  if ((_ = a.__cssModules) && (_ = _[t])) return _;
  if (n !== Be && Ie(n, t)) return i[t] = 4, n[t];
  if (w = l.config.globalProperties, Ie(w, t)) return w[t];
}, set({ _: e }, t, n) {
  const { data: s, setupState: r, ctx: o } = e;
  return Ii(r, t) ? (r[t] = n, !0) : s !== Be && Ie(s, t) ? (s[t] = n, !0) : Ie(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = n, !0);
}, has({ _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: o } }, i) {
  let a;
  return !!n[i] || e !== Be && Ie(e, i) || Ii(t, i) || (a = o[0]) && Ie(a, i) || Ie(s, i) || Ie(Dr, i) || Ie(r.config.globalProperties, i);
}, defineProperty(e, t, n) {
  return n.get != null ? e._.accessCache[t] = 0 : Ie(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
} };
function Dl(e) {
  return pe(e) ? e.reduce((t, n) => (t[n] = null, t), {}) : e;
}
let sa = !0;
function fh(e) {
  const t = Cu(e), n = e.proxy, s = e.ctx;
  sa = !1, t.beforeCreate && $l(t.beforeCreate, e, "bc");
  const { data: r, computed: o, methods: i, watch: a, provide: l, inject: c, created: d, beforeMount: _, mounted: w, beforeUpdate: k, updated: C, activated: M, deactivated: K, beforeDestroy: x, beforeUnmount: G, destroyed: Z, unmounted: E, render: U, renderTracked: T, renderTriggered: J, errorCaptured: se, serverPrefetch: ie, expose: ce, inheritAttrs: Ce, components: Ke, directives: ot, filters: Xe } = t;
  if (c && mh(c, s, null), i) for (const ge in i) {
    const ye = i[ge];
    me(ye) && (s[ge] = ye.bind(n));
  }
  if (r) {
    const ge = r.call(n, n);
    Ue(ge) && (e.data = qr(ge));
  }
  if (sa = !0, o) for (const ge in o) {
    const ye = o[ge], ft = me(ye) ? ye.bind(n, n) : me(ye.get) ? ye.get.bind(n, n) : bn, Et = !me(ye) && me(ye.set) ? ye.set.bind(n) : bn, mt = ne({ get: ft, set: Et });
    Object.defineProperty(s, ge, { enumerable: !0, configurable: !0, get: () => mt.value, set: (_t) => mt.value = _t });
  }
  if (a) for (const ge in a) Au(a[ge], s, n, ge);
  if (l) {
    const ge = me(l) ? l.call(n) : l;
    Reflect.ownKeys(ge).forEach((ye) => {
      wh(ye, ge[ye]);
    });
  }
  d && $l(d, e, "c");
  function Ne(ge, ye) {
    pe(ye) ? ye.forEach((ft) => ge(ft.bind(n))) : ye && ge(ye.bind(n));
  }
  if (Ne(oh, _), Ne(oi, w), Ne(ih, k), Ne(ah, C), Ne(nh, M), Ne(sh, K), Ne(ph, se), Ne(uh, T), Ne(ch, J), Ne(ii, G), Ne(Vr, E), Ne(lh, ie), pe(ce)) if (ce.length) {
    const ge = e.exposed || (e.exposed = {});
    ce.forEach((ye) => {
      Object.defineProperty(ge, ye, { get: () => n[ye], set: (ft) => n[ye] = ft, enumerable: !0 });
    });
  } else e.exposed || (e.exposed = {});
  U && e.render === bn && (e.render = U), Ce != null && (e.inheritAttrs = Ce), Ke && (e.components = Ke), ot && (e.directives = ot), ie && xu(e);
}
function mh(e, t, n = bn) {
  pe(e) && (e = ra(e));
  for (const s in e) {
    const r = e[s];
    let o;
    Ue(r) ? "default" in r ? o = wo(r.from || s, r.default, !0) : o = wo(r.from || s) : o = wo(r), yt(o) ? Object.defineProperty(t, s, { enumerable: !0, configurable: !0, get: () => o.value, set: (i) => o.value = i }) : t[s] = o;
  }
}
function $l(e, t, n) {
  wn(pe(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Au(e, t, n, s) {
  let r = s.includes(".") ? Mu(n, s) : () => n[s];
  if (Je(e)) {
    const o = t[e];
    me(o) && We(r, o);
  } else if (me(e)) We(r, e.bind(n));
  else if (Ue(e)) if (pe(e)) e.forEach((o) => Au(o, t, n, s));
  else {
    const o = me(e.handler) ? e.handler.bind(n) : t[e.handler];
    me(o) && We(r, o, e);
  }
}
function Cu(e) {
  const t = e.type, { mixins: n, extends: s } = t, { mixins: r, optionsCache: o, config: { optionMergeStrategies: i } } = e.appContext, a = o.get(t);
  let l;
  return a ? l = a : !r.length && !n && !s ? l = t : (l = {}, r.length && r.forEach((c) => Uo(l, c, i, !0)), Uo(l, t, i)), Ue(t) && o.set(t, l), l;
}
function Uo(e, t, n, s = !1) {
  const { mixins: r, extends: o } = t;
  o && Uo(e, o, n, !0), r && r.forEach((i) => Uo(e, i, n, !0));
  for (const i in t) if (!(s && i === "expose")) {
    const a = gh[i] || n && n[i];
    e[i] = a ? a(e[i], t[i]) : t[i];
  }
  return e;
}
const gh = { data: Pl, props: Fl, emits: Fl, methods: Tr, computed: Tr, beforeCreate: xt, created: xt, beforeMount: xt, mounted: xt, beforeUpdate: xt, updated: xt, beforeDestroy: xt, beforeUnmount: xt, destroyed: xt, unmounted: xt, activated: xt, deactivated: xt, errorCaptured: xt, serverPrefetch: xt, components: Tr, directives: Tr, watch: yh, provide: Pl, inject: vh };
function Pl(e, t) {
  return t ? e ? function() {
    return bt(me(e) ? e.call(this, this) : e, me(t) ? t.call(this, this) : t);
  } : t : e;
}
function vh(e, t) {
  return Tr(ra(e), ra(t));
}
function ra(e) {
  if (pe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
    return t;
  }
  return e;
}
function xt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Tr(e, t) {
  return e ? bt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Fl(e, t) {
  return e ? pe(e) && pe(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : bt(/* @__PURE__ */ Object.create(null), Dl(e), Dl(t ?? {})) : t;
}
function yh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = bt(/* @__PURE__ */ Object.create(null), e);
  for (const s in t) n[s] = xt(e[s], t[s]);
  return n;
}
function Eu() {
  return { app: null, config: { isNativeTag: pd, performance: !1, globalProperties: {}, optionMergeStrategies: {}, errorHandler: void 0, warnHandler: void 0, compilerOptions: {} }, mixins: [], components: {}, directives: {}, provides: /* @__PURE__ */ Object.create(null), optionsCache: /* @__PURE__ */ new WeakMap(), propsCache: /* @__PURE__ */ new WeakMap(), emitsCache: /* @__PURE__ */ new WeakMap() };
}
let bh = 0;
function _h(e, t) {
  return function(n, s = null) {
    me(n) || (n = bt({}, n)), s != null && !Ue(s) && (s = null);
    const r = Eu(), o = /* @__PURE__ */ new WeakSet(), i = [];
    let a = !1;
    const l = r.app = { _uid: bh++, _component: n, _props: s, _container: null, _context: r, _instance: null, version: tf, get config() {
      return r.config;
    }, set config(c) {
    }, use(c, ...d) {
      return o.has(c) || (c && me(c.install) ? (o.add(c), c.install(l, ...d)) : me(c) && (o.add(c), c(l, ...d))), l;
    }, mixin(c) {
      return r.mixins.includes(c) || r.mixins.push(c), l;
    }, component(c, d) {
      return d ? (r.components[c] = d, l) : r.components[c];
    }, directive(c, d) {
      return d ? (r.directives[c] = d, l) : r.directives[c];
    }, mount(c, d, _) {
      if (!a) {
        const w = l._ceVNode || Tt(n, s);
        return w.appContext = r, _ === !0 ? _ = "svg" : _ === !1 && (_ = void 0), e(w, c, _), a = !0, l._container = c, c.__vue_app__ = l, ci(w.component);
      }
    }, onUnmount(c) {
      i.push(c);
    }, unmount() {
      a && (wn(i, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
    }, provide(c, d) {
      return r.provides[c] = d, l;
    }, runWithContext(c) {
      const d = nr;
      nr = l;
      try {
        return c();
      } finally {
        nr = d;
      }
    } };
    return l;
  };
}
let nr = null;
function wh(e, t) {
  if (At) {
    let n = At.provides;
    const s = At.parent && At.parent.provides;
    s === n && (n = At.provides = Object.create(s)), n[e] = t;
  }
}
function wo(e, t, n = !1) {
  const s = Yh();
  if (s || nr) {
    let r = nr ? nr._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r) return r[e];
    if (arguments.length > 1) return n && me(t) ? t.call(s && s.proxy) : t;
  }
}
const Ru = {}, Ou = () => Object.create(Ru), Iu = (e) => Object.getPrototypeOf(e) === Ru;
function kh(e, t, n, s = !1) {
  const r = {}, o = Ou();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Lu(e, t, r, o);
  for (const i in e.propsOptions[0]) i in r || (r[i] = void 0);
  n ? e.props = s ? r : Ud(r) : e.type.props ? e.props = r : e.props = o, e.attrs = o;
}
function xh(e, t, n, s) {
  const { props: r, attrs: o, vnode: { patchFlag: i } } = e, a = we(r), [l] = e.propsOptions;
  let c = !1;
  if ((s || i > 0) && !(i & 16)) {
    if (i & 8) {
      const d = e.vnode.dynamicProps;
      for (let _ = 0; _ < d.length; _++) {
        let w = d[_];
        if (ai(e.emitsOptions, w)) continue;
        const k = t[w];
        if (l) if (Ie(o, w)) k !== o[w] && (o[w] = k, c = !0);
        else {
          const C = cs(w);
          r[C] = oa(l, a, C, k, e, !1);
        }
        else k !== o[w] && (o[w] = k, c = !0);
      }
    }
  } else {
    Lu(e, t, r, o) && (c = !0);
    let d;
    for (const _ in a) (!t || !Ie(t, _) && ((d = hs(_)) === _ || !Ie(t, d))) && (l ? n && (n[_] !== void 0 || n[d] !== void 0) && (r[_] = oa(l, a, _, void 0, e, !0)) : delete r[_]);
    if (o !== a) for (const _ in o) (!t || !Ie(t, _)) && (delete o[_], c = !0);
  }
  c && Nn(e.attrs, "set", "");
}
function Lu(e, t, n, s) {
  const [r, o] = e.propsOptions;
  let i = !1, a;
  if (t) for (let l in t) {
    if (Rr(l)) continue;
    const c = t[l];
    let d;
    r && Ie(r, d = cs(l)) ? !o || !o.includes(d) ? n[d] = c : (a || (a = {}))[d] = c : ai(e.emitsOptions, l) || (!(l in s) || c !== s[l]) && (s[l] = c, i = !0);
  }
  if (o) {
    const l = we(n), c = a || Be;
    for (let d = 0; d < o.length; d++) {
      const _ = o[d];
      n[_] = oa(r, l, _, c[_], e, !Ie(c, _));
    }
  }
  return i;
}
function oa(e, t, n, s, r, o) {
  const i = e[n];
  if (i != null) {
    const a = Ie(i, "default");
    if (a && s === void 0) {
      const l = i.default;
      if (i.type !== Function && !i.skipFactory && me(l)) {
        const { propsDefaults: c } = r;
        if (n in c) s = c[n];
        else {
          const d = Wr(r);
          s = c[n] = l.call(null, t), d();
        }
      } else s = l;
      r.ce && r.ce._setProp(n, s);
    }
    i[0] && (o && !a ? s = !1 : i[1] && (s === "" || s === hs(n)) && (s = !0));
  }
  return s;
}
const Sh = /* @__PURE__ */ new WeakMap();
function Nu(e, t, n = !1) {
  const s = n ? Sh : t.propsCache, r = s.get(e);
  if (r) return r;
  const o = e.props, i = {}, a = [];
  let l = !1;
  if (!me(e)) {
    const d = (_) => {
      l = !0;
      const [w, k] = Nu(_, t, !0);
      bt(i, w), k && a.push(...k);
    };
    !n && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d);
  }
  if (!o && !l) return Ue(e) && s.set(e, Qs), Qs;
  if (pe(o)) for (let d = 0; d < o.length; d++) {
    const _ = cs(o[d]);
    Bl(_) && (i[_] = Be);
  }
  else if (o) for (const d in o) {
    const _ = cs(d);
    if (Bl(_)) {
      const w = o[d], k = i[_] = pe(w) || me(w) ? { type: w } : bt({}, w), C = k.type;
      let M = !1, K = !0;
      if (pe(C)) for (let x = 0; x < C.length; ++x) {
        const G = C[x], Z = me(G) && G.name;
        if (Z === "Boolean") {
          M = !0;
          break;
        } else Z === "String" && (K = !1);
      }
      else M = me(C) && C.name === "Boolean";
      k[0] = M, k[1] = K, (M || Ie(k, "default")) && a.push(_);
    }
  }
  const c = [i, a];
  return Ue(e) && s.set(e, c), c;
}
function Bl(e) {
  return e[0] !== "$" && !Rr(e);
}
const $a = (e) => e === "_" || e === "__" || e === "_ctx" || e === "$stable", Pa = (e) => pe(e) ? e.map(yn) : [yn(e)], Th = (e, t, n) => {
  if (t._n) return t;
  const s = Xd((...r) => Pa(t(...r)), n);
  return s._c = !1, s;
}, Du = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if ($a(r)) continue;
    const o = e[r];
    if (me(o)) t[r] = Th(r, o, s);
    else if (o != null) {
      const i = Pa(o);
      t[r] = () => i;
    }
  }
}, $u = (e, t) => {
  const n = Pa(t);
  e.slots.default = () => n;
}, Pu = (e, t, n) => {
  for (const s in t) (n || !$a(s)) && (e[s] = t[s]);
}, Ah = (e, t, n) => {
  const s = e.slots = Ou();
  if (e.vnode.shapeFlag & 32) {
    const r = t.__;
    r && Zi(s, "__", r, !0);
    const o = t._;
    o ? (Pu(s, t, n), n && Zi(s, "_", o, !0)) : Du(t, s);
  } else t && $u(e, t);
}, Ch = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let o = !0, i = Be;
  if (s.shapeFlag & 32) {
    const a = t._;
    a ? n && a === 1 ? o = !1 : Pu(r, t, n) : (o = !t.$stable, Du(t, r)), i = t;
  } else t && ($u(e, t), i = { default: 1 });
  if (o) for (const a in r) !$a(a) && i[a] == null && delete r[a];
}, Bt = Uh;
function Eh(e) {
  return Rh(e);
}
function Rh(e, t) {
  const n = Po();
  n.__VUE__ = !0;
  const { insert: s, remove: r, patchProp: o, createElement: i, createText: a, createComment: l, setText: c, setElementText: d, parentNode: _, nextSibling: w, setScopeId: k = bn, insertStaticContent: C } = e, M = (g, y, I, B = null, L = null, $ = null, F = void 0, j = null, z = !!y.dynamicChildren) => {
    if (g === y) return;
    g && !mr(g, y) && (B = an(g), Ge(g, L, $, !0), g = null), y.patchFlag === -2 && (z = !1, y.dynamicChildren = null);
    const { type: P, ref: ee, shapeFlag: H } = y;
    switch (P) {
      case li:
        K(g, y, I, B);
        break;
      case ps:
        x(g, y, I, B);
        break;
      case ko:
        g == null && G(y, I, B, F);
        break;
      case ve:
        Ke(g, y, I, B, L, $, F, j, z);
        break;
      default:
        H & 1 ? U(g, y, I, B, L, $, F, j, z) : H & 6 ? ot(g, y, I, B, L, $, F, j, z) : (H & 64 || H & 128) && P.process(g, y, I, B, L, $, F, j, z, Xt);
    }
    ee != null && L ? Lr(ee, g && g.ref, $, y || g, !y) : ee == null && g && g.ref != null && Lr(g.ref, null, $, g, !0);
  }, K = (g, y, I, B) => {
    if (g == null) s(y.el = a(y.children), I, B);
    else {
      const L = y.el = g.el;
      y.children !== g.children && c(L, y.children);
    }
  }, x = (g, y, I, B) => {
    g == null ? s(y.el = l(y.children || ""), I, B) : y.el = g.el;
  }, G = (g, y, I, B) => {
    [g.el, g.anchor] = C(g.children, y, I, B, g.el, g.anchor);
  }, Z = ({ el: g, anchor: y }, I, B) => {
    let L;
    for (; g && g !== y; ) L = w(g), s(g, I, B), g = L;
    s(y, I, B);
  }, E = ({ el: g, anchor: y }) => {
    let I;
    for (; g && g !== y; ) I = w(g), r(g), g = I;
    r(y);
  }, U = (g, y, I, B, L, $, F, j, z) => {
    y.type === "svg" ? F = "svg" : y.type === "math" && (F = "mathml"), g == null ? T(y, I, B, L, $, F, j, z) : ie(g, y, L, $, F, j, z);
  }, T = (g, y, I, B, L, $, F, j) => {
    let z, P;
    const { props: ee, shapeFlag: H, transition: re, dirs: X } = g;
    if (z = g.el = i(g.type, $, ee && ee.is, ee), H & 8 ? d(z, g.children) : H & 16 && se(g.children, z, null, B, L, Li(g, $), F, j), X && xs(g, null, B, "created"), J(z, g, g.scopeId, F, B), ee) {
      for (const D in ee) D !== "value" && !Rr(D) && o(z, D, null, ee[D], $, B);
      "value" in ee && o(z, "value", null, ee.value, $), (P = ee.onVnodeBeforeMount) && fn(P, B, g);
    }
    X && xs(g, null, B, "beforeMount");
    const he = Oh(L, re);
    he && re.beforeEnter(z), s(z, y, I), ((P = ee && ee.onVnodeMounted) || he || X) && Bt(() => {
      P && fn(P, B, g), he && re.enter(z), X && xs(g, null, B, "mounted");
    }, L);
  }, J = (g, y, I, B, L) => {
    if (I && k(g, I), B) for (let $ = 0; $ < B.length; $++) k(g, B[$]);
    if (L) {
      let $ = L.subTree;
      if (y === $ || ju($.type) && ($.ssContent === y || $.ssFallback === y)) {
        const F = L.vnode;
        J(g, F, F.scopeId, F.slotScopeIds, L.parent);
      }
    }
  }, se = (g, y, I, B, L, $, F, j, z = 0) => {
    for (let P = z; P < g.length; P++) {
      const ee = g[P] = j ? rs(g[P]) : yn(g[P]);
      M(null, ee, y, I, B, L, $, F, j);
    }
  }, ie = (g, y, I, B, L, $, F) => {
    const j = y.el = g.el;
    let { patchFlag: z, dynamicChildren: P, dirs: ee } = y;
    z |= g.patchFlag & 16;
    const H = g.props || Be, re = y.props || Be;
    let X;
    if (I && Ss(I, !1), (X = re.onVnodeBeforeUpdate) && fn(X, I, y, g), ee && xs(y, g, I, "beforeUpdate"), I && Ss(I, !0), (H.innerHTML && re.innerHTML == null || H.textContent && re.textContent == null) && d(j, ""), P ? ce(g.dynamicChildren, P, j, I, B, Li(y, L), $) : F || ft(g, y, j, null, I, B, Li(y, L), $, !1), z > 0) {
      if (z & 16) Ce(j, H, re, I, L);
      else if (z & 2 && H.class !== re.class && o(j, "class", null, re.class, L), z & 4 && o(j, "style", H.style, re.style, L), z & 8) {
        const he = y.dynamicProps;
        for (let D = 0; D < he.length; D++) {
          const R = he[D], Q = H[R], le = re[R];
          (le !== Q || R === "value") && o(j, R, Q, le, L, I);
        }
      }
      z & 1 && g.children !== y.children && d(j, y.children);
    } else !F && P == null && Ce(j, H, re, I, L);
    ((X = re.onVnodeUpdated) || ee) && Bt(() => {
      X && fn(X, I, y, g), ee && xs(y, g, I, "updated");
    }, B);
  }, ce = (g, y, I, B, L, $, F) => {
    for (let j = 0; j < y.length; j++) {
      const z = g[j], P = y[j], ee = z.el && (z.type === ve || !mr(z, P) || z.shapeFlag & 198) ? _(z.el) : I;
      M(z, P, ee, null, B, L, $, F, !0);
    }
  }, Ce = (g, y, I, B, L) => {
    if (y !== I) {
      if (y !== Be) for (const $ in y) !Rr($) && !($ in I) && o(g, $, y[$], null, L, B);
      for (const $ in I) {
        if (Rr($)) continue;
        const F = I[$], j = y[$];
        F !== j && $ !== "value" && o(g, $, j, F, L, B);
      }
      "value" in I && o(g, "value", y.value, I.value, L);
    }
  }, Ke = (g, y, I, B, L, $, F, j, z) => {
    const P = y.el = g ? g.el : a(""), ee = y.anchor = g ? g.anchor : a("");
    let { patchFlag: H, dynamicChildren: re, slotScopeIds: X } = y;
    X && (j = j ? j.concat(X) : X), g == null ? (s(P, I, B), s(ee, I, B), se(y.children || [], I, ee, L, $, F, j, z)) : H > 0 && H & 64 && re && g.dynamicChildren ? (ce(g.dynamicChildren, re, I, L, $, F, j), (y.key != null || L && y === L.subTree) && Fu(g, y, !0)) : ft(g, y, I, ee, L, $, F, j, z);
  }, ot = (g, y, I, B, L, $, F, j, z) => {
    y.slotScopeIds = j, g == null ? y.shapeFlag & 512 ? L.ctx.activate(y, I, B, F, z) : Xe(y, I, B, L, $, F, z) : Ne(g, y, z);
  }, Xe = (g, y, I, B, L, $, F) => {
    const j = g.component = Gh(g, B, L);
    if (Su(g) && (j.ctx.renderer = Xt), Zh(j, !1, F), j.asyncDep) {
      if (L && L.registerDep(j, ge, F), !g.el) {
        const z = j.subTree = Tt(ps);
        x(null, z, y, I), g.placeholder = z.el;
      }
    } else ge(j, g, y, I, L, $, F);
  }, Ne = (g, y, I) => {
    const B = y.component = g.component;
    if (zh(g, y, I)) if (B.asyncDep && !B.asyncResolved) {
      ye(B, y, I);
      return;
    } else B.next = y, B.update();
    else y.el = g.el, B.vnode = y;
  }, ge = (g, y, I, B, L, $, F) => {
    const j = () => {
      if (g.isMounted) {
        let { next: H, bu: re, u: X, parent: he, vnode: D } = g;
        {
          const Te = Bu(g);
          if (Te) {
            H && (H.el = D.el, ye(g, H, F)), Te.asyncDep.then(() => {
              g.isUnmounted || j();
            });
            return;
          }
        }
        let R = H, Q;
        Ss(g, !1), H ? (H.el = D.el, ye(g, H, F)) : H = D, re && _o(re), (Q = H.props && H.props.onVnodeBeforeUpdate) && fn(Q, he, H, D), Ss(g, !0);
        const le = Ml(g), xe = g.subTree;
        g.subTree = le, M(xe, le, _(xe.el), an(xe), g, L, $), H.el = le.el, R === null && Mh(g, le.el), X && Bt(X, L), (Q = H.props && H.props.onVnodeUpdated) && Bt(() => fn(Q, he, H, D), L);
      } else {
        let H;
        const { el: re, props: X } = y, { bm: he, m: D, parent: R, root: Q, type: le } = g, xe = Nr(y);
        Ss(g, !1), he && _o(he), !xe && (H = X && X.onVnodeBeforeMount) && fn(H, R, y), Ss(g, !0);
        {
          Q.ce && Q.ce._def.shadowRoot !== !1 && Q.ce._injectChildStyle(le);
          const Te = g.subTree = Ml(g);
          M(null, Te, I, B, g, L, $), y.el = Te.el;
        }
        if (D && Bt(D, L), !xe && (H = X && X.onVnodeMounted)) {
          const Te = y;
          Bt(() => fn(H, R, Te), L);
        }
        (y.shapeFlag & 256 || R && Nr(R.vnode) && R.vnode.shapeFlag & 256) && g.a && Bt(g.a, L), g.isMounted = !0, y = I = B = null;
      }
    };
    g.scope.on();
    const z = g.effect = new eu(j);
    g.scope.off();
    const P = g.update = z.run.bind(z), ee = g.job = z.runIfDirty.bind(z);
    ee.i = g, ee.id = g.uid, z.scheduler = () => Na(ee), Ss(g, !0), P();
  }, ye = (g, y, I) => {
    y.component = g;
    const B = g.vnode.props;
    g.vnode = y, g.next = null, xh(g, y.props, B, I), Ch(g, y.children, I), Fn(), Nl(g), Bn();
  }, ft = (g, y, I, B, L, $, F, j, z = !1) => {
    const P = g && g.children, ee = g ? g.shapeFlag : 0, H = y.children, { patchFlag: re, shapeFlag: X } = y;
    if (re > 0) {
      if (re & 128) {
        mt(P, H, I, B, L, $, F, j, z);
        return;
      } else if (re & 256) {
        Et(P, H, I, B, L, $, F, j, z);
        return;
      }
    }
    X & 8 ? (ee & 16 && ct(P, L, $), H !== P && d(I, H)) : ee & 16 ? X & 16 ? mt(P, H, I, B, L, $, F, j, z) : ct(P, L, $, !0) : (ee & 8 && d(I, ""), X & 16 && se(H, I, B, L, $, F, j, z));
  }, Et = (g, y, I, B, L, $, F, j, z) => {
    g = g || Qs, y = y || Qs;
    const P = g.length, ee = y.length, H = Math.min(P, ee);
    let re;
    for (re = 0; re < H; re++) {
      const X = y[re] = z ? rs(y[re]) : yn(y[re]);
      M(g[re], X, I, null, L, $, F, j, z);
    }
    P > ee ? ct(g, L, $, !0, !1, H) : se(y, I, B, L, $, F, j, z, H);
  }, mt = (g, y, I, B, L, $, F, j, z) => {
    let P = 0;
    const ee = y.length;
    let H = g.length - 1, re = ee - 1;
    for (; P <= H && P <= re; ) {
      const X = g[P], he = y[P] = z ? rs(y[P]) : yn(y[P]);
      if (mr(X, he)) M(X, he, I, null, L, $, F, j, z);
      else break;
      P++;
    }
    for (; P <= H && P <= re; ) {
      const X = g[H], he = y[re] = z ? rs(y[re]) : yn(y[re]);
      if (mr(X, he)) M(X, he, I, null, L, $, F, j, z);
      else break;
      H--, re--;
    }
    if (P > H) {
      if (P <= re) {
        const X = re + 1, he = X < ee ? y[X].el : B;
        for (; P <= re; ) M(null, y[P] = z ? rs(y[P]) : yn(y[P]), I, he, L, $, F, j, z), P++;
      }
    } else if (P > re) for (; P <= H; ) Ge(g[P], L, $, !0), P++;
    else {
      const X = P, he = P, D = /* @__PURE__ */ new Map();
      for (P = he; P <= re; P++) {
        const De = y[P] = z ? rs(y[P]) : yn(y[P]);
        De.key != null && D.set(De.key, P);
      }
      let R, Q = 0;
      const le = re - he + 1;
      let xe = !1, Te = 0;
      const et = new Array(le);
      for (P = 0; P < le; P++) et[P] = 0;
      for (P = X; P <= H; P++) {
        const De = g[P];
        if (Q >= le) {
          Ge(De, L, $, !0);
          continue;
        }
        let Ye;
        if (De.key != null) Ye = D.get(De.key);
        else for (R = he; R <= re; R++) if (et[R - he] === 0 && mr(De, y[R])) {
          Ye = R;
          break;
        }
        Ye === void 0 ? Ge(De, L, $, !0) : (et[Ye - he] = P + 1, Ye >= Te ? Te = Ye : xe = !0, M(De, y[Ye], I, null, L, $, F, j, z), Q++);
      }
      const tt = xe ? Ih(et) : Qs;
      for (R = tt.length - 1, P = le - 1; P >= 0; P--) {
        const De = he + P, Ye = y[De], Ut = y[De + 1], ln = De + 1 < ee ? Ut.el || Ut.placeholder : B;
        et[P] === 0 ? M(null, Ye, I, ln, L, $, F, j, z) : xe && (R < 0 || P !== tt[R] ? _t(Ye, I, ln, 2) : R--);
      }
    }
  }, _t = (g, y, I, B, L = null) => {
    const { el: $, type: F, transition: j, children: z, shapeFlag: P } = g;
    if (P & 6) {
      _t(g.component.subTree, y, I, B);
      return;
    }
    if (P & 128) {
      g.suspense.move(y, I, B);
      return;
    }
    if (P & 64) {
      F.move(g, y, I, Xt);
      return;
    }
    if (F === ve) {
      s($, y, I);
      for (let ee = 0; ee < z.length; ee++) _t(z[ee], y, I, B);
      s(g.anchor, y, I);
      return;
    }
    if (F === ko) {
      Z(g, y, I);
      return;
    }
    if (B !== 2 && P & 1 && j) if (B === 0) j.beforeEnter($), s($, y, I), Bt(() => j.enter($), L);
    else {
      const { leave: ee, delayLeave: H, afterLeave: re } = j, X = () => {
        g.ctx.isUnmounted ? r($) : s($, y, I);
      }, he = () => {
        ee($, () => {
          X(), re && re();
        });
      };
      H ? H($, X, he) : he();
    }
    else s($, y, I);
  }, Ge = (g, y, I, B = !1, L = !1) => {
    const { type: $, props: F, ref: j, children: z, dynamicChildren: P, shapeFlag: ee, patchFlag: H, dirs: re, cacheIndex: X } = g;
    if (H === -2 && (L = !1), j != null && (Fn(), Lr(j, null, I, g, !0), Bn()), X != null && (y.renderCache[X] = void 0), ee & 256) {
      y.ctx.deactivate(g);
      return;
    }
    const he = ee & 1 && re, D = !Nr(g);
    let R;
    if (D && (R = F && F.onVnodeBeforeUnmount) && fn(R, y, g), ee & 6) Re(g.component, I, B);
    else {
      if (ee & 128) {
        g.suspense.unmount(I, B);
        return;
      }
      he && xs(g, null, y, "beforeUnmount"), ee & 64 ? g.type.remove(g, y, I, Xt, B) : P && !P.hasOnce && ($ !== ve || H > 0 && H & 64) ? ct(P, y, I, !1, !0) : ($ === ve && H & 384 || !L && ee & 16) && ct(z, y, I), B && jn(g);
    }
    (D && (R = F && F.onVnodeUnmounted) || he) && Bt(() => {
      R && fn(R, y, g), he && xs(g, null, y, "unmounted");
    }, I);
  }, jn = (g) => {
    const { type: y, el: I, anchor: B, transition: L } = g;
    if (y === ve) {
      kn(I, B);
      return;
    }
    if (y === ko) {
      E(g);
      return;
    }
    const $ = () => {
      r(I), L && !L.persisted && L.afterLeave && L.afterLeave();
    };
    if (g.shapeFlag & 1 && L && !L.persisted) {
      const { leave: F, delayLeave: j } = L, z = () => F(I, $);
      j ? j(g.el, $, z) : z();
    } else $();
  }, kn = (g, y) => {
    let I;
    for (; g !== y; ) I = w(g), r(g), g = I;
    r(y);
  }, Re = (g, y, I) => {
    const { bum: B, scope: L, job: $, subTree: F, um: j, m: z, a: P, parent: ee, slots: { __: H } } = g;
    zl(z), zl(P), B && _o(B), ee && pe(H) && H.forEach((re) => {
      ee.renderCache[re] = void 0;
    }), L.stop(), $ && ($.flags |= 8, Ge(F, g, y, I)), j && Bt(j, y), Bt(() => {
      g.isUnmounted = !0;
    }, y), y && y.pendingBranch && !y.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === y.pendingId && (y.deps--, y.deps === 0 && y.resolve());
  }, ct = (g, y, I, B = !1, L = !1, $ = 0) => {
    for (let F = $; F < g.length; F++) Ge(g[F], y, I, B, L);
  }, an = (g) => {
    if (g.shapeFlag & 6) return an(g.component.subTree);
    if (g.shapeFlag & 128) return g.suspense.next();
    const y = w(g.anchor || g.el), I = y && y[eh];
    return I ? w(I) : y;
  };
  let xn = !1;
  const qn = (g, y, I) => {
    g == null ? y._vnode && Ge(y._vnode, null, null, !0) : M(y._vnode || null, g, y, null, null, null, I), y._vnode = g, xn || (xn = !0, Nl(), _u(), xn = !1);
  }, Xt = { p: M, um: Ge, m: _t, r: jn, mt: Xe, mc: se, pc: ft, pbc: ce, n: an, o: e };
  return { render: qn, hydrate: void 0, createApp: _h(qn) };
}
function Li({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ss({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Oh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Fu(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (pe(s) && pe(r)) for (let o = 0; o < s.length; o++) {
    const i = s[o];
    let a = r[o];
    a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[o] = rs(r[o]), a.el = i.el), !n && a.patchFlag !== -2 && Fu(i, a)), a.type === li && (a.el = i.el), a.type === ps && !a.el && (a.el = i.el);
  }
}
function Ih(e) {
  const t = e.slice(), n = [0];
  let s, r, o, i, a;
  const l = e.length;
  for (s = 0; s < l; s++) {
    const c = e[s];
    if (c !== 0) {
      if (r = n[n.length - 1], e[r] < c) {
        t[s] = r, n.push(s);
        continue;
      }
      for (o = 0, i = n.length - 1; o < i; ) a = o + i >> 1, e[n[a]] < c ? o = a + 1 : i = a;
      c < e[n[o]] && (o > 0 && (t[s] = n[o - 1]), n[o] = s);
    }
  }
  for (o = n.length, i = n[o - 1]; o-- > 0; ) n[o] = i, i = t[i];
  return n;
}
function Bu(e) {
  const t = e.subTree.component;
  if (t) return t.asyncDep && !t.asyncResolved ? t : Bu(t);
}
function zl(e) {
  if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
const Lh = Symbol.for("v-scx"), Nh = () => wo(Lh);
function We(e, t, n) {
  return zu(e, t, n);
}
function zu(e, t, n = Be) {
  const { immediate: s, deep: r, flush: o, once: i } = n, a = bt({}, n), l = t && s || !t && o !== "post";
  let c;
  if (jr) {
    if (o === "sync") {
      const k = Nh();
      c = k.__watcherHandles || (k.__watcherHandles = []);
    } else if (!l) {
      const k = () => {
      };
      return k.stop = bn, k.resume = bn, k.pause = bn, k;
    }
  }
  const d = At;
  a.call = (k, C, M) => wn(k, d, C, M);
  let _ = !1;
  o === "post" ? a.scheduler = (k) => {
    Bt(k, d && d.suspense);
  } : o !== "sync" && (_ = !0, a.scheduler = (k, C) => {
    C ? k() : Na(k);
  }), a.augmentJob = (k) => {
    t && (k.flags |= 4), _ && (k.flags |= 2, d && (k.id = d.uid, k.i = d));
  };
  const w = Yd(e, t, a);
  return jr && (c ? c.push(w) : l && w()), w;
}
function Dh(e, t, n) {
  const s = this.proxy, r = Je(e) ? e.includes(".") ? Mu(s, e) : () => s[e] : e.bind(s, s);
  let o;
  me(t) ? o = t : (o = t.handler, n = t);
  const i = Wr(this), a = zu(r, o.bind(s), n);
  return i(), a;
}
function Mu(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++) s = s[n[r]];
    return s;
  };
}
const $h = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${cs(t)}Modifiers`] || e[`${hs(t)}Modifiers`];
function Ph(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || Be;
  let r = n;
  const o = t.startsWith("update:"), i = o && $h(s, t.slice(7));
  i && (i.trim && (r = n.map((d) => Je(d) ? d.trim() : d)), i.number && (r = n.map(Ji)));
  let a, l = s[a = Ai(t)] || s[a = Ai(cs(t))];
  !l && o && (l = s[a = Ai(hs(t))]), l && wn(l, e, 6, r);
  const c = s[a + "Once"];
  if (c) {
    if (!e.emitted) e.emitted = {};
    else if (e.emitted[a]) return;
    e.emitted[a] = !0, wn(c, e, 6, r);
  }
}
function Uu(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0) return r;
  const o = e.emits;
  let i = {}, a = !1;
  if (!me(e)) {
    const l = (c) => {
      const d = Uu(c, t, !0);
      d && (a = !0, bt(i, d));
    };
    !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
  }
  return !o && !a ? (Ue(e) && s.set(e, null), null) : (pe(o) ? o.forEach((l) => i[l] = null) : bt(i, o), Ue(e) && s.set(e, i), i);
}
function ai(e, t) {
  return !e || !Qo(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ie(e, t[0].toLowerCase() + t.slice(1)) || Ie(e, hs(t)) || Ie(e, t));
}
function Ml(e) {
  const { type: t, vnode: n, proxy: s, withProxy: r, propsOptions: [o], slots: i, attrs: a, emit: l, render: c, renderCache: d, props: _, data: w, setupState: k, ctx: C, inheritAttrs: M } = e, K = Mo(e);
  let x, G;
  try {
    if (n.shapeFlag & 4) {
      const E = r || s, U = E;
      x = yn(c.call(U, E, d, _, k, w, C)), G = a;
    } else {
      const E = t;
      x = yn(E.length > 1 ? E(_, { attrs: a, slots: i, emit: l }) : E(_, null)), G = t.props ? a : Fh(a);
    }
  } catch (E) {
    $r.length = 0, si(E, e, 1), x = Tt(ps);
  }
  let Z = x;
  if (G && M !== !1) {
    const E = Object.keys(G), { shapeFlag: U } = Z;
    E.length && U & 7 && (o && E.some(Sa) && (G = Bh(G, o)), Z = ir(Z, G, !1, !0));
  }
  return n.dirs && (Z = ir(Z, null, !1, !0), Z.dirs = Z.dirs ? Z.dirs.concat(n.dirs) : n.dirs), n.transition && Da(Z, n.transition), x = Z, Mo(K), x;
}
const Fh = (e) => {
  let t;
  for (const n in e) (n === "class" || n === "style" || Qo(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Bh = (e, t) => {
  const n = {};
  for (const s in e) (!Sa(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function zh(e, t, n) {
  const { props: s, children: r, component: o } = e, { props: i, children: a, patchFlag: l } = t, c = o.emitsOptions;
  if (t.dirs || t.transition) return !0;
  if (n && l >= 0) {
    if (l & 1024) return !0;
    if (l & 16) return s ? Ul(s, i, c) : !!i;
    if (l & 8) {
      const d = t.dynamicProps;
      for (let _ = 0; _ < d.length; _++) {
        const w = d[_];
        if (i[w] !== s[w] && !ai(c, w)) return !0;
      }
    }
  } else return (r || a) && (!a || !a.$stable) ? !0 : s === i ? !1 : s ? i ? Ul(s, i, c) : !0 : !!i;
  return !1;
}
function Ul(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length) return !0;
  for (let r = 0; r < s.length; r++) {
    const o = s[r];
    if (t[o] !== e[o] && !ai(n, o)) return !0;
  }
  return !1;
}
function Mh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e) (e = t.vnode).el = n, t = t.parent;
    else break;
  }
}
const ju = (e) => e.__isSuspense;
function Uh(e, t) {
  t && t.pendingBranch ? pe(e) ? t.effects.push(...e) : t.effects.push(e) : Qd(e);
}
const ve = Symbol.for("v-fgt"), li = Symbol.for("v-txt"), ps = Symbol.for("v-cmt"), ko = Symbol.for("v-stc"), $r = [];
let Mt = null;
function v(e = !1) {
  $r.push(Mt = e ? null : []);
}
function jh() {
  $r.pop(), Mt = $r[$r.length - 1] || null;
}
let Ur = 1;
function jl(e, t = !1) {
  Ur += e, e < 0 && Mt && t && (Mt.hasOnce = !0);
}
function qu(e) {
  return e.dynamicChildren = Ur > 0 ? Mt || Qs : null, jh(), Ur > 0 && Mt && Mt.push(e), e;
}
function b(e, t, n, s, r, o) {
  return qu(m(e, t, n, s, r, o, !0));
}
function In(e, t, n, s, r) {
  return qu(Tt(e, t, n, s, r, !0));
}
function Hu(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function mr(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Vu = ({ key: e }) => e ?? null, xo = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e != null ? Je(e) || yt(e) || me(e) ? { i: Jt, r: e, k: t, f: !!n } : e : null);
function m(e, t = null, n = null, s = 0, r = null, o = e === ve ? 0 : 1, i = !1, a = !1) {
  const l = { __v_isVNode: !0, __v_skip: !0, type: e, props: t, key: t && Vu(t), ref: t && xo(t), scopeId: ku, slotScopeIds: null, children: n, component: null, suspense: null, ssContent: null, ssFallback: null, dirs: null, transition: null, el: null, anchor: null, target: null, targetStart: null, targetAnchor: null, staticCount: 0, shapeFlag: o, patchFlag: s, dynamicProps: r, dynamicChildren: null, appContext: null, ctx: Jt };
  return a ? (Fa(l, n), o & 128 && e.normalize(l)) : n && (l.shapeFlag |= Je(n) ? 8 : 16), Ur > 0 && !i && Mt && (l.patchFlag > 0 || o & 6) && l.patchFlag !== 32 && Mt.push(l), l;
}
const Tt = qh;
function qh(e, t = null, n = null, s = 0, r = null, o = !1) {
  if ((!e || e === dh) && (e = ps), Hu(e)) {
    const a = ir(e, t, !0);
    return n && Fa(a, n), Ur > 0 && !o && Mt && (a.shapeFlag & 6 ? Mt[Mt.indexOf(e)] = a : Mt.push(a)), a.patchFlag = -2, a;
  }
  if (ef(e) && (e = e.__vccOpts), t) {
    t = Hh(t);
    let { class: a, style: l } = t;
    a && !Je(a) && (t.class = _e(a)), Ue(l) && (La(l) && !pe(l) && (l = bt({}, l)), t.style = fe(l));
  }
  const i = Je(e) ? 1 : ju(e) ? 128 : th(e) ? 64 : Ue(e) ? 4 : me(e) ? 2 : 0;
  return m(e, t, n, s, r, i, o, !0);
}
function Hh(e) {
  return e ? La(e) || Iu(e) ? bt({}, e) : e : null;
}
function ir(e, t, n = !1, s = !1) {
  const { props: r, ref: o, patchFlag: i, children: a, transition: l } = e, c = t ? Vh(r || {}, t) : r, d = { __v_isVNode: !0, __v_skip: !0, type: e.type, props: c, key: c && Vu(c), ref: t && t.ref ? n && o ? pe(o) ? o.concat(xo(t)) : [o, xo(t)] : xo(t) : o, scopeId: e.scopeId, slotScopeIds: e.slotScopeIds, children: a, target: e.target, targetStart: e.targetStart, targetAnchor: e.targetAnchor, staticCount: e.staticCount, shapeFlag: e.shapeFlag, patchFlag: t && e.type !== ve ? i === -1 ? 16 : i | 16 : i, dynamicProps: e.dynamicProps, dynamicChildren: e.dynamicChildren, appContext: e.appContext, dirs: e.dirs, transition: l, component: e.component, suspense: e.suspense, ssContent: e.ssContent && ir(e.ssContent), ssFallback: e.ssFallback && ir(e.ssFallback), placeholder: e.placeholder, el: e.el, anchor: e.anchor, ctx: e.ctx, ce: e.ce };
  return l && s && Da(d, l.clone(d)), d;
}
function On(e = " ", t = 0) {
  return Tt(li, null, e, t);
}
function Ni(e, t) {
  const n = Tt(ko, null, e);
  return n.staticCount = t, n;
}
function Y(e = "", t = !1) {
  return t ? (v(), In(ps, null, e)) : Tt(ps, null, e);
}
function yn(e) {
  return e == null || typeof e == "boolean" ? Tt(ps) : pe(e) ? Tt(ve, null, e.slice()) : Hu(e) ? rs(e) : Tt(li, null, String(e));
}
function rs(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ir(e);
}
function Fa(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null) t = null;
  else if (pe(t)) n = 16;
  else if (typeof t == "object") if (s & 65) {
    const r = t.default;
    r && (r._c && (r._d = !1), Fa(e, r()), r._c && (r._d = !0));
    return;
  } else {
    n = 32;
    const r = t._;
    !r && !Iu(t) ? t._ctx = Jt : r === 3 && Jt && (Jt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
  }
  else me(t) ? (t = { default: t, _ctx: Jt }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [On(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Vh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s) if (r === "class") t.class !== s.class && (t.class = _e([t.class, s.class]));
    else if (r === "style") t.style = fe([t.style, s.style]);
    else if (Qo(r)) {
      const o = t[r], i = s[r];
      i && o !== i && !(pe(o) && o.includes(i)) && (t[r] = o ? [].concat(o, i) : i);
    } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function fn(e, t, n, s = null) {
  wn(e, t, 7, [n, s]);
}
const Wh = Eu();
let Kh = 0;
function Gh(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Wh, o = { uid: Kh++, vnode: e, type: s, parent: t, appContext: r, root: null, next: null, subTree: null, effect: null, update: null, job: null, scope: new kd(!0), render: null, proxy: null, exposed: null, exposeProxy: null, withProxy: null, provides: t ? t.provides : Object.create(r.provides), ids: t ? t.ids : ["", 0, 0], accessCache: null, renderCache: [], components: null, directives: null, propsOptions: Nu(s, r), emitsOptions: Uu(s, r), emit: null, emitted: null, propsDefaults: Be, inheritAttrs: s.inheritAttrs, ctx: Be, data: Be, props: Be, attrs: Be, slots: Be, refs: Be, setupState: Be, setupContext: null, suspense: n, suspenseId: n ? n.pendingId : 0, asyncDep: null, asyncResolved: !1, isMounted: !1, isUnmounted: !1, isDeactivated: !1, bc: null, c: null, bm: null, m: null, bu: null, u: null, um: null, bum: null, da: null, a: null, rtg: null, rtc: null, ec: null, sp: null };
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = Ph.bind(null, o), e.ce && e.ce(o), o;
}
let At = null;
const Yh = () => At || Jt;
let jo, ia;
{
  const e = Po(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (o) => {
      r.length > 1 ? r.forEach((i) => i(o)) : r[0](o);
    };
  };
  jo = t("__VUE_INSTANCE_SETTERS__", (n) => At = n), ia = t("__VUE_SSR_SETTERS__", (n) => jr = n);
}
const Wr = (e) => {
  const t = At;
  return jo(e), e.scope.on(), () => {
    e.scope.off(), jo(t);
  };
}, ql = () => {
  At && At.scope.off(), jo(null);
};
function Wu(e) {
  return e.vnode.shapeFlag & 4;
}
let jr = !1;
function Zh(e, t = !1, n = !1) {
  t && ia(t);
  const { props: s, children: r } = e.vnode, o = Wu(e);
  kh(e, s, o, t), Ah(e, r, n || t);
  const i = o ? Jh(e, t) : void 0;
  return t && ia(!1), i;
}
function Jh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, hh);
  const { setup: s } = n;
  if (s) {
    Fn();
    const r = e.setupContext = s.length > 1 ? Xh(e) : null, o = Wr(e), i = Hr(s, e, 0, [e.props, r]), a = Kc(i);
    if (Bn(), o(), (a || e.sp) && !Nr(e) && xu(e), a) {
      if (i.then(ql, ql), t) return i.then((l) => {
        Hl(e, l);
      }).catch((l) => {
        si(l, e, 0);
      });
      e.asyncDep = i;
    } else Hl(e, i);
  } else Ku(e);
}
function Hl(e, t, n) {
  me(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Ue(t) && (e.setupState = vu(t)), Ku(e);
}
function Ku(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || bn);
  {
    const r = Wr(e);
    Fn();
    try {
      fh(e);
    } finally {
      Bn(), r();
    }
  }
}
const Qh = { get(e, t) {
  return vt(e, "get", ""), e[t];
} };
function Xh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return { attrs: new Proxy(e.attrs, Qh), slots: e.slots, emit: e.emit, expose: t };
}
function ci(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(vu(jd(e.exposed)), { get(t, n) {
    if (n in t) return t[n];
    if (n in Dr) return Dr[n](e);
  }, has(t, n) {
    return n in t || n in Dr;
  } })) : e.proxy;
}
function ef(e) {
  return me(e) && "__vccOpts" in e;
}
const ne = (e, t) => Kd(e, t, jr), tf = "3.5.18";
let aa;
const Vl = typeof window < "u" && window.trustedTypes;
if (Vl) try {
  aa = Vl.createPolicy("vue", { createHTML: (e) => e });
} catch {
}
const Gu = aa ? (e) => aa.createHTML(e) : (e) => e, nf = "http://www.w3.org/2000/svg", sf = "http://www.w3.org/1998/Math/MathML", Ln = typeof document < "u" ? document : null, Wl = Ln && Ln.createElement("template"), rf = { insert: (e, t, n) => {
  t.insertBefore(e, n || null);
}, remove: (e) => {
  const t = e.parentNode;
  t && t.removeChild(e);
}, createElement: (e, t, n, s) => {
  const r = t === "svg" ? Ln.createElementNS(nf, e) : t === "mathml" ? Ln.createElementNS(sf, e) : n ? Ln.createElement(e, { is: n }) : Ln.createElement(e);
  return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
}, createText: (e) => Ln.createTextNode(e), createComment: (e) => Ln.createComment(e), setText: (e, t) => {
  e.nodeValue = t;
}, setElementText: (e, t) => {
  e.textContent = t;
}, parentNode: (e) => e.parentNode, nextSibling: (e) => e.nextSibling, querySelector: (e) => Ln.querySelector(e), setScopeId(e, t) {
  e.setAttribute(t, "");
}, insertStaticContent(e, t, n, s, r, o) {
  const i = n ? n.previousSibling : t.lastChild;
  if (r && (r === o || r.nextSibling)) for (; t.insertBefore(r.cloneNode(!0), n), !(r === o || !(r = r.nextSibling)); ) ;
  else {
    Wl.innerHTML = Gu(s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e);
    const a = Wl.content;
    if (s === "svg" || s === "mathml") {
      const l = a.firstChild;
      for (; l.firstChild; ) a.appendChild(l.firstChild);
      a.removeChild(l);
    }
    t.insertBefore(a, n);
  }
  return [i ? i.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
} }, of = Symbol("_vtc");
function af(e, t, n) {
  const s = e[of];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const qo = Symbol("_vod"), Yu = Symbol("_vsh"), lf = { beforeMount(e, { value: t }, { transition: n }) {
  e[qo] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : gr(e, t);
}, mounted(e, { value: t }, { transition: n }) {
  n && t && n.enter(e);
}, updated(e, { value: t, oldValue: n }, { transition: s }) {
  !t != !n && (s ? t ? (s.beforeEnter(e), gr(e, !0), s.enter(e)) : s.leave(e, () => {
    gr(e, !1);
  }) : gr(e, t));
}, beforeUnmount(e, { value: t }) {
  gr(e, t);
} };
function gr(e, t) {
  e.style.display = t ? e[qo] : "none", e[Yu] = !t;
}
const cf = Symbol(""), uf = /(^|;)\s*display\s*:/;
function pf(e, t, n) {
  const s = e.style, r = Je(n);
  let o = !1;
  if (n && !r) {
    if (t) if (Je(t)) for (const i of t.split(";")) {
      const a = i.slice(0, i.indexOf(":")).trim();
      n[a] == null && So(s, a, "");
    }
    else for (const i in t) n[i] == null && So(s, i, "");
    for (const i in n) i === "display" && (o = !0), So(s, i, n[i]);
  } else if (r) {
    if (t !== n) {
      const i = s[cf];
      i && (n += ";" + i), s.cssText = n, o = uf.test(n);
    }
  } else t && e.removeAttribute("style");
  qo in e && (e[qo] = o ? s.display : "", e[Yu] && (s.display = "none"));
}
const Kl = /\s*!important$/;
function So(e, t, n) {
  if (pe(n)) n.forEach((s) => So(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--")) e.setProperty(t, n);
  else {
    const s = df(e, t);
    Kl.test(n) ? e.setProperty(hs(s), n.replace(Kl, ""), "important") : e[s] = n;
  }
}
const Gl = ["Webkit", "Moz", "ms"], Di = {};
function df(e, t) {
  const n = Di[t];
  if (n) return n;
  let s = cs(t);
  if (s !== "filter" && s in e) return Di[t] = s;
  s = Zc(s);
  for (let r = 0; r < Gl.length; r++) {
    const o = Gl[r] + s;
    if (o in e) return Di[t] = o;
  }
  return t;
}
const Yl = "http://www.w3.org/1999/xlink";
function Zl(e, t, n, s, r, o = wd(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Yl, t.slice(6, t.length)) : e.setAttributeNS(Yl, t, n) : n == null || o && !Jc(n) ? e.removeAttribute(t) : e.setAttribute(t, o ? "" : ds(n) ? String(n) : n);
}
function Jl(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Gu(n) : n);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && !o.includes("-")) {
    const a = o === "OPTION" ? e.getAttribute("value") || "" : e.value, l = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
    (a !== l || !("_value" in e)) && (e.value = l), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let i = !1;
  if (n === "" || n == null) {
    const a = typeof e[t];
    a === "boolean" ? n = Jc(n) : n == null && a === "string" ? (n = "", i = !0) : a === "number" && (n = 0, i = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  i && e.removeAttribute(r || t);
}
function Ys(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function hf(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Ql = Symbol("_vei");
function ff(e, t, n, s, r = null) {
  const o = e[Ql] || (e[Ql] = {}), i = o[t];
  if (s && i) i.value = s;
  else {
    const [a, l] = mf(t);
    if (s) {
      const c = o[t] = yf(s, r);
      Ys(e, a, c, l);
    } else i && (hf(e, a, i, l), o[t] = void 0);
  }
}
const Xl = /(?:Once|Passive|Capture)$/;
function mf(e) {
  let t;
  if (Xl.test(e)) {
    t = {};
    let n;
    for (; n = e.match(Xl); ) e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : hs(e.slice(2)), t];
}
let $i = 0;
const gf = Promise.resolve(), vf = () => $i || (gf.then(() => $i = 0), $i = Date.now());
function yf(e, t) {
  const n = (s) => {
    if (!s._vts) s._vts = Date.now();
    else if (s._vts <= n.attached) return;
    wn(bf(s, n.value), t, 5, [s]);
  };
  return n.value = e, n.attached = vf(), n;
}
function bf(e, t) {
  if (pe(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map((s) => (r) => !r._stopped && s && s(r));
  } else return t;
}
const ec = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, _f = (e, t, n, s, r, o) => {
  const i = r === "svg";
  t === "class" ? af(e, s, i) : t === "style" ? pf(e, n, s) : Qo(t) ? Sa(t) || ff(e, t, n, s, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : wf(e, t, s, i)) ? (Jl(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Zl(e, t, s, i, o, t !== "value")) : e._isVueCE && (/[A-Z]/.test(t) || !Je(s)) ? Jl(e, cs(t), s, o, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Zl(e, t, s, i));
};
function wf(e, t, n, s) {
  if (s) return !!(t === "innerHTML" || t === "textContent" || t in e && ec(t) && me(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE") return !1;
  }
  return ec(t) && Je(n) ? !1 : t in e;
}
const tc = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return pe(t) ? (n) => _o(t, n) : t;
};
function kf(e) {
  e.target.composing = !0;
}
function nc(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Pi = Symbol("_assign"), Ts = { created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
  e[Pi] = tc(r);
  const o = s || r.props && r.props.type === "number";
  Ys(e, t ? "change" : "input", (i) => {
    if (i.target.composing) return;
    let a = e.value;
    n && (a = a.trim()), o && (a = Ji(a)), e[Pi](a);
  }), n && Ys(e, "change", () => {
    e.value = e.value.trim();
  }), t || (Ys(e, "compositionstart", kf), Ys(e, "compositionend", nc), Ys(e, "change", nc));
}, mounted(e, { value: t }) {
  e.value = t ?? "";
}, beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: o } }, i) {
  if (e[Pi] = tc(i), e.composing) return;
  const a = (o || e.type === "number") && !/^0\d/.test(e.value) ? Ji(e.value) : e.value, l = t ?? "";
  a !== l && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === l) || (e.value = l));
} }, xf = ["ctrl", "shift", "alt", "meta"], Sf = { stop: (e) => e.stopPropagation(), prevent: (e) => e.preventDefault(), self: (e) => e.target !== e.currentTarget, ctrl: (e) => !e.ctrlKey, shift: (e) => !e.shiftKey, alt: (e) => !e.altKey, meta: (e) => !e.metaKey, left: (e) => "button" in e && e.button !== 0, middle: (e) => "button" in e && e.button !== 1, right: (e) => "button" in e && e.button !== 2, exact: (e, t) => xf.some((n) => e[`${n}Key`] && !t.includes(n)) }, Es = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...o) => {
    for (let i = 0; i < t.length; i++) {
      const a = Sf[t[i]];
      if (a && a(r, t)) return;
    }
    return e(r, ...o);
  });
}, Tf = { esc: "escape", space: " ", up: "arrow-up", left: "arrow-left", right: "arrow-right", down: "arrow-down", delete: "backspace" }, To = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r)) return;
    const o = hs(r.key);
    if (t.some((i) => i === o || Tf[i] === o)) return e(r);
  });
}, Af = bt({ patchProp: _f }, rf);
let sc;
function Cf() {
  return sc || (sc = Eh(Af));
}
const Ef = (...e) => {
  const t = Cf().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Of(s);
    if (!r) return;
    const o = t._component;
    !me(o) && !o.render && !o.template && (o.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const i = n(r, !1, Rf(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), i;
  }, t;
};
function Rf(e) {
  if (e instanceof SVGElement) return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Of(e) {
  return Je(e) ? document.querySelector(e) : e;
}
const Zu = /* @__PURE__ */ new Set(["customer_required", "token_invalid"]), la = (e) => !!e && Zu.has(e), sr = (e) => {
  const t = e.replace("#", ""), n = parseInt(t.substr(0, 2), 16), s = parseInt(t.substr(2, 2), 16), r = parseInt(t.substr(4, 2), 16);
  return (n * 299 + s * 587 + r * 114) / 1e3 < 128;
}, If = (e, t) => {
  const n = e.replace("#", ""), s = parseInt(n.substr(0, 2), 16), r = parseInt(n.substr(2, 2), 16), o = parseInt(n.substr(4, 2), 16), i = sr(e), a = i ? Math.min(255, s + t) : Math.max(0, s - t), l = i ? Math.min(255, r + t) : Math.max(0, r - t), c = i ? Math.min(255, o + t) : Math.max(0, o - t);
  return `#${a.toString(16).padStart(2, "0")}${l.toString(16).padStart(2, "0")}${c.toString(16).padStart(2, "0")}`;
}, vr = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), Lf = (e) => {
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
function Ba() {
  return { async: !1, breaks: !1, extensions: null, gfm: !0, hooks: null, pedantic: !1, renderer: null, silent: !1, tokenizer: null, walkTokens: null };
}
var $s = Ba();
function rc(e) {
  $s = e;
}
var Pr = { exec: () => null };
function Le(e, t = "") {
  let n = typeof e == "string" ? e : e.source;
  const s = { replace: (r, o) => {
    let i = typeof o == "string" ? o : o.source;
    return i = i.replace(Ct.caret, "$1"), n = n.replace(r, i), s;
  }, getRegex: () => new RegExp(n, t) };
  return s;
}
var Ct = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] /, listReplaceTask: /^\[[ xX]\] +/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (e) => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}#`), htmlBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}<(?:[a-z].*>|!--)`, "i") }, Nf = /^(?:[ \t]*(?:\n|$))+/, Df = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, $f = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Kr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Pf = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, za = /(?:[*+-]|\d{1,9}[.)])/, Ju = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Qu = Le(Ju).replace(/bull/g, za).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Ff = Le(Ju).replace(/bull/g, za).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ma = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, Bf = /^[^\n]+/, Ua = /(?!\s*\])(?:\\.|[^\[\]\\])+/, zf = Le(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ua).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Mf = Le(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, za).getRegex(), ui = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", ja = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Uf = Le("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", ja).replace("tag", ui).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Xu = Le(Ma).replace("hr", Kr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex(), jf = Le(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Xu).getRegex(), qa = { blockquote: jf, code: Df, def: zf, fences: $f, heading: Pf, hr: Kr, html: Uf, lheading: Qu, list: Mf, newline: Nf, paragraph: Xu, table: Pr, text: Bf }, oc = Le("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", Kr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex(), qf = { ...qa, lheading: Ff, table: oc, paragraph: Le(Ma).replace("hr", Kr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", oc).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", ui).getRegex() }, Hf = { ...qa, html: Le(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", ja).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: Pr, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: Le(Ma).replace("hr", Kr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Qu).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, Vf = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Wf = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ep = /^( {2,}|\\)\n(?!\s*$)/, Kf = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, pi = /[\p{P}\p{S}]/u, Ha = /[\s\p{P}\p{S}]/u, tp = /[^\s\p{P}\p{S}]/u, Gf = Le(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ha).getRegex(), np = /(?!~)[\p{P}\p{S}]/u, Yf = /(?!~)[\s\p{P}\p{S}]/u, Zf = /(?:[^\s\p{P}\p{S}]|~)/u, Jf = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, sp = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, Qf = Le(sp, "u").replace(/punct/g, pi).getRegex(), Xf = Le(sp, "u").replace(/punct/g, np).getRegex(), rp = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", em = Le(rp, "gu").replace(/notPunctSpace/g, tp).replace(/punctSpace/g, Ha).replace(/punct/g, pi).getRegex(), tm = Le(rp, "gu").replace(/notPunctSpace/g, Zf).replace(/punctSpace/g, Yf).replace(/punct/g, np).getRegex(), nm = Le("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, tp).replace(/punctSpace/g, Ha).replace(/punct/g, pi).getRegex(), sm = Le(/\\(punct)/, "gu").replace(/punct/g, pi).getRegex(), rm = Le(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), om = Le(ja).replace("(?:-->|$)", "-->").getRegex(), im = Le("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", om).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Ho = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, am = Le(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", Ho).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), op = Le(/^!?\[(label)\]\[(ref)\]/).replace("label", Ho).replace("ref", Ua).getRegex(), ip = Le(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ua).getRegex(), lm = Le("reflink|nolink(?!\\()", "g").replace("reflink", op).replace("nolink", ip).getRegex(), Va = { _backpedal: Pr, anyPunctuation: sm, autolink: rm, blockSkip: Jf, br: ep, code: Wf, del: Pr, emStrongLDelim: Qf, emStrongRDelimAst: em, emStrongRDelimUnd: nm, escape: Vf, link: am, nolink: ip, punctuation: Gf, reflink: op, reflinkSearch: lm, tag: im, text: Kf, url: Pr }, cm = { ...Va, link: Le(/^!?\[(label)\]\((.*?)\)/).replace("label", Ho).getRegex(), reflink: Le(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Ho).getRegex() }, ca = { ...Va, emStrongRDelimAst: tm, emStrongLDelim: Xf, url: Le(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/, text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/ }, um = { ...ca, br: Le(ep).replace("{2,}", "*").getRegex(), text: Le(ca.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, mo = { normal: qa, gfm: qf, pedantic: Hf }, yr = { normal: Va, gfm: ca, breaks: um, pedantic: cm }, pm = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, ic = (e) => pm[e];
function mn(e, t) {
  if (t) {
    if (Ct.escapeTest.test(e)) return e.replace(Ct.escapeReplace, ic);
  } else if (Ct.escapeTestNoEncode.test(e)) return e.replace(Ct.escapeReplaceNoEncode, ic);
  return e;
}
function ac(e) {
  try {
    e = encodeURI(e).replace(Ct.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function lc(e, t) {
  var o;
  const n = e.replace(Ct.findPipe, (i, a, l) => {
    let c = !1, d = a;
    for (; --d >= 0 && l[d] === "\\"; ) c = !c;
    return c ? "|" : " |";
  }), s = n.split(Ct.splitPipe);
  let r = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((o = s.at(-1)) != null && o.trim()) && s.pop(), t) if (s.length > t) s.splice(t);
  else for (; s.length < t; ) s.push("");
  for (; r < s.length; r++) s[r] = s[r].trim().replace(Ct.slashPipe, "|");
  return s;
}
function br(e, t, n) {
  const s = e.length;
  if (s === 0) return "";
  let r = 0;
  for (; r < s && e.charAt(s - r - 1) === t; ) r++;
  return e.slice(0, s - r);
}
function dm(e, t) {
  if (e.indexOf(t[1]) === -1) return -1;
  let n = 0;
  for (let s = 0; s < e.length; s++) if (e[s] === "\\") s++;
  else if (e[s] === t[0]) n++;
  else if (e[s] === t[1] && (n--, n < 0)) return s;
  return n > 0 ? -2 : -1;
}
function cc(e, t, n, s, r) {
  const o = t.href, i = t.title || null, a = e[1].replace(r.other.outputLinkReplace, "$1");
  s.state.inLink = !0;
  const l = { type: e[0].charAt(0) === "!" ? "image" : "link", raw: n, href: o, title: i, text: a, tokens: s.inlineTokens(a) };
  return s.state.inLink = !1, l;
}
function hm(e, t, n) {
  const s = e.match(n.other.indentCodeCompensation);
  if (s === null) return t;
  const r = s[1];
  return t.split(`
`).map((o) => {
    const i = o.match(n.other.beginningSpace);
    if (i === null) return o;
    const [a] = i;
    return a.length >= r.length ? o.slice(r.length) : o;
  }).join(`
`);
}
var Vo = class {
  constructor(e) {
    Fe(this, "options");
    Fe(this, "rules");
    Fe(this, "lexer");
    this.options = e || $s;
  }
  space(e) {
    const t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    const t = this.rules.block.code.exec(e);
    if (t) {
      const n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : br(n, `
`) };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const n = t[0], s = hm(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    const t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        const s = br(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: t[0], depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    const t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: br(t[0], `
`) };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = br(t[0], `
`).split(`
`), s = "", r = "";
      const o = [];
      for (; n.length > 0; ) {
        let i = !1;
        const a = [];
        let l;
        for (l = 0; l < n.length; l++) if (this.rules.other.blockquoteStart.test(n[l])) a.push(n[l]), i = !0;
        else if (!i) a.push(n[l]);
        else break;
        n = n.slice(l);
        const c = a.join(`
`), d = c.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${c}` : c, r = r ? `${r}
${d}` : d;
        const _ = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(d, o, !0), this.lexer.state.top = _, n.length === 0) break;
        const w = o.at(-1);
        if ((w == null ? void 0 : w.type) === "code") break;
        if ((w == null ? void 0 : w.type) === "blockquote") {
          const k = w, C = k.raw + `
` + n.join(`
`), M = this.blockquote(C);
          o[o.length - 1] = M, s = s.substring(0, s.length - k.raw.length) + M.raw, r = r.substring(0, r.length - k.text.length) + M.text;
          break;
        } else if ((w == null ? void 0 : w.type) === "list") {
          const k = w, C = k.raw + `
` + n.join(`
`), M = this.list(C);
          o[o.length - 1] = M, s = s.substring(0, s.length - w.raw.length) + M.raw, r = r.substring(0, r.length - k.raw.length) + M.raw, n = C.substring(o.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: o, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim();
      const s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: !1, items: [] };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      const o = this.rules.other.listItemRegex(n);
      let i = !1;
      for (; e; ) {
        let l = !1, c = "", d = "";
        if (!(t = o.exec(e)) || this.rules.block.hr.test(e)) break;
        c = t[0], e = e.substring(c.length);
        let _ = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (x) => " ".repeat(3 * x.length)), w = e.split(`
`, 1)[0], k = !_.trim(), C = 0;
        if (this.options.pedantic ? (C = 2, d = _.trimStart()) : k ? C = t[1].length + 1 : (C = t[2].search(this.rules.other.nonSpaceChar), C = C > 4 ? 1 : C, d = _.slice(C), C += t[1].length), k && this.rules.other.blankLine.test(w) && (c += w + `
`, e = e.substring(w.length + 1), l = !0), !l) {
          const x = this.rules.other.nextBulletRegex(C), G = this.rules.other.hrRegex(C), Z = this.rules.other.fencesBeginRegex(C), E = this.rules.other.headingBeginRegex(C), U = this.rules.other.htmlBeginRegex(C);
          for (; e; ) {
            const T = e.split(`
`, 1)[0];
            let J;
            if (w = T, this.options.pedantic ? (w = w.replace(this.rules.other.listReplaceNesting, "  "), J = w) : J = w.replace(this.rules.other.tabCharGlobal, "    "), Z.test(w) || E.test(w) || U.test(w) || x.test(w) || G.test(w)) break;
            if (J.search(this.rules.other.nonSpaceChar) >= C || !w.trim()) d += `
` + J.slice(C);
            else {
              if (k || _.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || Z.test(_) || E.test(_) || G.test(_)) break;
              d += `
` + w;
            }
            !k && !w.trim() && (k = !0), c += T + `
`, e = e.substring(T.length + 1), _ = J.slice(C);
          }
        }
        r.loose || (i ? r.loose = !0 : this.rules.other.doubleBlankLine.test(c) && (i = !0));
        let M = null, K;
        this.options.gfm && (M = this.rules.other.listIsTask.exec(d), M && (K = M[0] !== "[ ] ", d = d.replace(this.rules.other.listReplaceTask, ""))), r.items.push({ type: "list_item", raw: c, task: !!M, checked: K, loose: !1, text: d, tokens: [] }), r.raw += c;
      }
      const a = r.items.at(-1);
      if (a) a.raw = a.raw.trimEnd(), a.text = a.text.trimEnd();
      else return;
      r.raw = r.raw.trimEnd();
      for (let l = 0; l < r.items.length; l++) if (this.lexer.state.top = !1, r.items[l].tokens = this.lexer.blockTokens(r.items[l].text, []), !r.loose) {
        const c = r.items[l].tokens.filter((_) => _.type === "space"), d = c.length > 0 && c.some((_) => this.rules.other.anyLine.test(_.raw));
        r.loose = d;
      }
      if (r.loose) for (let l = 0; l < r.items.length; l++) r.items[l].loose = !0;
      return r;
    }
  }
  html(e) {
    const t = this.rules.block.html.exec(e);
    if (t) return { type: "html", block: !0, raw: t[0], pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: t[0] };
  }
  def(e) {
    const t = this.rules.block.def.exec(e);
    if (t) {
      const n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: t[0], href: s, title: r };
    }
  }
  table(e) {
    var i;
    const t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    const n = lc(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = (i = t[3]) != null && i.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = { type: "table", raw: t[0], header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (const a of s) this.rules.other.tableAlignRight.test(a) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? o.align.push("left") : o.align.push(null);
      for (let a = 0; a < n.length; a++) o.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: !0, align: o.align[a] });
      for (const a of r) o.rows.push(lc(a, o.header.length).map((l, c) => ({ text: l, tokens: this.lexer.inline(l), header: !1, align: o.align[c] })));
      return o;
    }
  }
  lheading(e) {
    const t = this.rules.block.lheading.exec(e);
    if (t) return { type: "heading", raw: t[0], depth: t[2].charAt(0) === "=" ? 1 : 2, text: t[1], tokens: this.lexer.inline(t[1]) };
  }
  paragraph(e) {
    const t = this.rules.block.paragraph.exec(e);
    if (t) {
      const n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    const t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    const t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    const t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: !1, text: t[0] };
  }
  link(e) {
    const t = this.rules.inline.link.exec(e);
    if (t) {
      const n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n)) return;
        const o = br(n.slice(0, -1), "\\");
        if ((n.length - o.length) % 2 === 0) return;
      } else {
        const o = dm(t[2], "()");
        if (o === -2) return;
        if (o > -1) {
          const i = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + o;
          t[2] = t[2].substring(0, o), t[0] = t[0].substring(0, i).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        const o = this.rules.other.pedanticHrefTitle.exec(s);
        o && (s = o[1], r = o[3]);
      } else r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), cc(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      const s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        const o = n[0].charAt(0);
        return { type: "text", raw: o, text: o };
      }
      return cc(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!(!s || s[3] && n.match(this.rules.other.unicodeAlphaNumeric)) && (!(s[1] || s[2]) || !n || this.rules.inline.punctuation.exec(n))) {
      const r = [...s[0]].length - 1;
      let o, i, a = r, l = 0;
      const c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + r); (s = c.exec(t)) != null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (i = [...o].length, s[3] || s[4]) {
          a += i;
          continue;
        } else if ((s[5] || s[6]) && r % 3 && !((r + i) % 3)) {
          l += i;
          continue;
        }
        if (a -= i, a > 0) continue;
        i = Math.min(i, i + a + l);
        const d = [...s[0]][0].length, _ = e.slice(0, r + s.index + d + i);
        if (Math.min(r, i) % 2) {
          const k = _.slice(1, -1);
          return { type: "em", raw: _, text: k, tokens: this.lexer.inlineTokens(k) };
        }
        const w = _.slice(2, -2);
        return { type: "strong", raw: _, text: w, tokens: this.lexer.inlineTokens(w) };
      }
    }
  }
  codespan(e) {
    const t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " ");
      const s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    const t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e) {
    const t = this.rules.inline.del.exec(e);
    if (t) return { type: "del", raw: t[0], text: t[2], tokens: this.lexer.inlineTokens(t[2]) };
  }
  autolink(e) {
    const t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    var n;
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let s, r;
      if (t[2] === "@") s = t[0], r = "mailto:" + s;
      else {
        let o;
        do
          o = t[0], t[0] = ((n = this.rules.inline._backpedal.exec(t[0])) == null ? void 0 : n[0]) ?? "";
        while (o !== t[0]);
        s = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return { type: "link", raw: t[0], text: s, href: r, tokens: [{ type: "text", raw: s, text: s }] };
    }
  }
  inlineText(e) {
    const t = this.rules.inline.text.exec(e);
    if (t) {
      const n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
}, $n = class ua {
  constructor(t) {
    Fe(this, "tokens");
    Fe(this, "options");
    Fe(this, "state");
    Fe(this, "tokenizer");
    Fe(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || $s, this.options.tokenizer = this.options.tokenizer || new Vo(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: !1, inRawBlock: !1, top: !0 };
    const n = { other: Ct, block: mo.normal, inline: yr.normal };
    this.options.pedantic ? (n.block = mo.pedantic, n.inline = yr.pedantic) : this.options.gfm && (n.block = mo.gfm, this.options.breaks ? n.inline = yr.breaks : n.inline = yr.gfm), this.tokenizer.rules = n;
  }
  static get rules() {
    return { block: mo, inline: yr };
  }
  static lex(t, n) {
    return new ua(n).lex(t);
  }
  static lexInline(t, n) {
    return new ua(n).inlineTokens(t);
  }
  lex(t) {
    t = t.replace(Ct.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let n = 0; n < this.inlineQueue.length; n++) {
      const s = this.inlineQueue[n];
      this.inlineTokens(s.src, s.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, n = [], s = !1) {
    var r, o, i;
    for (this.options.pedantic && (t = t.replace(Ct.tabCharGlobal, "    ").replace(Ct.spaceLine, "")); t; ) {
      let a;
      if ((o = (r = this.options.extensions) == null ? void 0 : r.block) != null && o.some((c) => (a = c.call({ lexer: this }, t, n)) ? (t = t.substring(a.raw.length), n.push(a), !0) : !1)) continue;
      if (a = this.tokenizer.space(t)) {
        t = t.substring(a.raw.length);
        const c = n.at(-1);
        a.raw.length === 1 && c !== void 0 ? c.raw += `
` : n.push(a);
        continue;
      }
      if (a = this.tokenizer.code(t)) {
        t = t.substring(a.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.at(-1).src = c.text) : n.push(a);
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
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.raw, this.inlineQueue.at(-1).src = c.text) : this.tokens.links[a.tag] || (this.tokens.links[a.tag] = { href: a.href, title: a.title });
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
      if ((i = this.options.extensions) != null && i.startBlock) {
        let c = 1 / 0;
        const d = t.slice(1);
        let _;
        this.options.extensions.startBlock.forEach((w) => {
          _ = w.call({ lexer: this }, d), typeof _ == "number" && _ >= 0 && (c = Math.min(c, _));
        }), c < 1 / 0 && c >= 0 && (l = t.substring(0, c + 1));
      }
      if (this.state.top && (a = this.tokenizer.paragraph(l))) {
        const c = n.at(-1);
        s && (c == null ? void 0 : c.type) === "paragraph" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(a), s = l.length !== t.length, t = t.substring(a.raw.length);
        continue;
      }
      if (a = this.tokenizer.text(t)) {
        t = t.substring(a.raw.length);
        const c = n.at(-1);
        (c == null ? void 0 : c.type) === "text" ? (c.raw += `
` + a.raw, c.text += `
` + a.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : n.push(a);
        continue;
      }
      if (t) {
        const c = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(c);
          break;
        } else throw new Error(c);
      }
    }
    return this.state.top = !0, n;
  }
  inline(t, n = []) {
    return this.inlineQueue.push({ src: t, tokens: n }), n;
  }
  inlineTokens(t, n = []) {
    var a, l, c;
    let s = t, r = null;
    if (this.tokens.links) {
      const d = Object.keys(this.tokens.links);
      if (d.length > 0) for (; (r = this.tokenizer.rules.inline.reflinkSearch.exec(s)) != null; ) d.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (r = this.tokenizer.rules.inline.anyPunctuation.exec(s)) != null; ) s = s.slice(0, r.index) + "++" + s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; (r = this.tokenizer.rules.inline.blockSkip.exec(s)) != null; ) s = s.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    let o = !1, i = "";
    for (; t; ) {
      o || (i = ""), o = !1;
      let d;
      if ((l = (a = this.options.extensions) == null ? void 0 : a.inline) != null && l.some((w) => (d = w.call({ lexer: this }, t, n)) ? (t = t.substring(d.raw.length), n.push(d), !0) : !1)) continue;
      if (d = this.tokenizer.escape(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.tag(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.link(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(d.raw.length);
        const w = n.at(-1);
        d.type === "text" && (w == null ? void 0 : w.type) === "text" ? (w.raw += d.raw, w.text += d.text) : n.push(d);
        continue;
      }
      if (d = this.tokenizer.emStrong(t, s, i)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.codespan(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.br(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.del(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (d = this.tokenizer.autolink(t)) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      if (!this.state.inLink && (d = this.tokenizer.url(t))) {
        t = t.substring(d.raw.length), n.push(d);
        continue;
      }
      let _ = t;
      if ((c = this.options.extensions) != null && c.startInline) {
        let w = 1 / 0;
        const k = t.slice(1);
        let C;
        this.options.extensions.startInline.forEach((M) => {
          C = M.call({ lexer: this }, k), typeof C == "number" && C >= 0 && (w = Math.min(w, C));
        }), w < 1 / 0 && w >= 0 && (_ = t.substring(0, w + 1));
      }
      if (d = this.tokenizer.inlineText(_)) {
        t = t.substring(d.raw.length), d.raw.slice(-1) !== "_" && (i = d.raw.slice(-1)), o = !0;
        const w = n.at(-1);
        (w == null ? void 0 : w.type) === "text" ? (w.raw += d.raw, w.text += d.text) : n.push(d);
        continue;
      }
      if (t) {
        const w = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(w);
          break;
        } else throw new Error(w);
      }
    }
    return n;
  }
}, Wo = class {
  constructor(e) {
    Fe(this, "options");
    Fe(this, "parser");
    this.options = e || $s;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    var o;
    const s = (o = (t || "").match(Ct.notSpaceStart)) == null ? void 0 : o[0], r = e.replace(Ct.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + mn(s) + '">' + (n ? r : mn(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : mn(r, !0)) + `</code></pre>
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
    for (let i = 0; i < e.items.length; i++) {
      const a = e.items[i];
      s += this.listitem(a);
    }
    const r = t ? "ol" : "ul", o = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + o + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    var n;
    let t = "";
    if (e.task) {
      const s = this.checkbox({ checked: !!e.checked });
      e.loose ? ((n = e.tokens[0]) == null ? void 0 : n.type) === "paragraph" ? (e.tokens[0].text = s + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = s + " " + mn(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({ type: "text", raw: s + " ", text: s + " ", escaped: !0 }) : t += s + " ";
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
    for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      const o = e.rows[r];
      n = "";
      for (let i = 0; i < o.length; i++) n += this.tablecell(o[i]);
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
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${mn(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    const s = this.parser.parseInline(n), r = ac(e);
    if (r === null) return s;
    e = r;
    let o = '<a href="' + e + '"';
    return t && (o += ' title="' + mn(t) + '"'), o += ">" + s + "</a>", o;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    const r = ac(e);
    if (r === null) return mn(n);
    e = r;
    let o = `<img src="${e}" alt="${n}"`;
    return t && (o += ` title="${mn(t)}"`), o += ">", o;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : mn(e.text);
  }
}, Wa = class {
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
}, Pn = class pa {
  constructor(t) {
    Fe(this, "options");
    Fe(this, "renderer");
    Fe(this, "textRenderer");
    this.options = t || $s, this.options.renderer = this.options.renderer || new Wo(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Wa();
  }
  static parse(t, n) {
    return new pa(n).parse(t);
  }
  static parseInline(t, n) {
    return new pa(n).parseInline(t);
  }
  parse(t, n = !0) {
    var r, o;
    let s = "";
    for (let i = 0; i < t.length; i++) {
      const a = t[i];
      if ((o = (r = this.options.extensions) == null ? void 0 : r.renderers) != null && o[a.type]) {
        const c = a, d = this.options.extensions.renderers[c.type].call({ parser: this }, c);
        if (d !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(c.type)) {
          s += d || "";
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
          let c = l, d = this.renderer.text(c);
          for (; i + 1 < t.length && t[i + 1].type === "text"; ) c = t[++i], d += `
` + this.renderer.text(c);
          n ? s += this.renderer.paragraph({ type: "paragraph", raw: d, text: d, tokens: [{ type: "text", raw: d, text: d, escaped: !0 }] }) : s += d;
          continue;
        }
        default: {
          const c = 'Token with "' + l.type + '" type was not found.';
          if (this.options.silent) return console.error(c), "";
          throw new Error(c);
        }
      }
    }
    return s;
  }
  parseInline(t, n = this.renderer) {
    var r, o;
    let s = "";
    for (let i = 0; i < t.length; i++) {
      const a = t[i];
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
          if (this.options.silent) return console.error(c), "";
          throw new Error(c);
        }
      }
    }
    return s;
  }
}, Yi, Ao = (Yi = class {
  constructor(e) {
    Fe(this, "options");
    Fe(this, "block");
    this.options = e || $s;
  }
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  provideLexer() {
    return this.block ? $n.lex : $n.lexInline;
  }
  provideParser() {
    return this.block ? Pn.parse : Pn.parseInline;
  }
}, Fe(Yi, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), Yi), fm = class {
  constructor(...e) {
    Fe(this, "defaults", Ba());
    Fe(this, "options", this.setOptions);
    Fe(this, "parse", this.parseMarkdown(!0));
    Fe(this, "parseInline", this.parseMarkdown(!1));
    Fe(this, "Parser", Pn);
    Fe(this, "Renderer", Wo);
    Fe(this, "TextRenderer", Wa);
    Fe(this, "Lexer", $n);
    Fe(this, "Tokenizer", Vo);
    Fe(this, "Hooks", Ao);
    this.use(...e);
  }
  walkTokens(e, t) {
    var s, r;
    let n = [];
    for (const o of e) switch (n = n.concat(t.call(this, o)), o.type) {
      case "table": {
        const i = o;
        for (const a of i.header) n = n.concat(this.walkTokens(a.tokens, t));
        for (const a of i.rows) for (const l of a) n = n.concat(this.walkTokens(l.tokens, t));
        break;
      }
      case "list": {
        const i = o;
        n = n.concat(this.walkTokens(i.items, t));
        break;
      }
      default: {
        const i = o;
        (r = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && r[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((a) => {
          const l = i[a].flat(1 / 0);
          n = n.concat(this.walkTokens(l, t));
        }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
      }
    }
    return n;
  }
  use(...e) {
    const t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      const s = { ...n };
      if (s.async = this.defaults.async || s.async || !1, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name) throw new Error("extension name required");
        if ("renderer" in r) {
          const o = t.renderers[r.name];
          o ? t.renderers[r.name] = function(...i) {
            let a = r.renderer.apply(this, i);
            return a === !1 && (a = o.apply(this, i)), a;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          const o = t[r.level];
          o ? o.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        const r = this.defaults.renderer || new Wo(this.defaults);
        for (const o in n.renderer) {
          if (!(o in r)) throw new Error(`renderer '${o}' does not exist`);
          if (["options", "parser"].includes(o)) continue;
          const i = o, a = n.renderer[i], l = r[i];
          r[i] = (...c) => {
            let d = a.apply(r, c);
            return d === !1 && (d = l.apply(r, c)), d || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        const r = this.defaults.tokenizer || new Vo(this.defaults);
        for (const o in n.tokenizer) {
          if (!(o in r)) throw new Error(`tokenizer '${o}' does not exist`);
          if (["options", "rules", "lexer"].includes(o)) continue;
          const i = o, a = n.tokenizer[i], l = r[i];
          r[i] = (...c) => {
            let d = a.apply(r, c);
            return d === !1 && (d = l.apply(r, c)), d;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        const r = this.defaults.hooks || new Ao();
        for (const o in n.hooks) {
          if (!(o in r)) throw new Error(`hook '${o}' does not exist`);
          if (["options", "block"].includes(o)) continue;
          const i = o, a = n.hooks[i], l = r[i];
          Ao.passThroughHooks.has(o) ? r[i] = (c) => {
            if (this.defaults.async) return Promise.resolve(a.call(r, c)).then((_) => l.call(r, _));
            const d = a.call(r, c);
            return l.call(r, d);
          } : r[i] = (...c) => {
            let d = a.apply(r, c);
            return d === !1 && (d = l.apply(r, c)), d;
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
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return $n.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return Pn.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (t, n) => {
      const s = { ...n }, r = { ...this.defaults, ...s }, o = this.onError(!!r.silent, !!r.async);
      if (this.defaults.async === !0 && s.async === !1) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof t > "u" || t === null) return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof t != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
      r.hooks && (r.hooks.options = r, r.hooks.block = e);
      const i = r.hooks ? r.hooks.provideLexer() : e ? $n.lex : $n.lexInline, a = r.hooks ? r.hooks.provideParser() : e ? Pn.parse : Pn.parseInline;
      if (r.async) return Promise.resolve(r.hooks ? r.hooks.preprocess(t) : t).then((l) => i(l, r)).then((l) => r.hooks ? r.hooks.processAllTokens(l) : l).then((l) => r.walkTokens ? Promise.all(this.walkTokens(l, r.walkTokens)).then(() => l) : l).then((l) => a(l, r)).then((l) => r.hooks ? r.hooks.postprocess(l) : l).catch(o);
      try {
        r.hooks && (t = r.hooks.preprocess(t));
        let l = i(t, r);
        r.hooks && (l = r.hooks.processAllTokens(l)), r.walkTokens && this.walkTokens(l, r.walkTokens);
        let c = a(l, r);
        return r.hooks && (c = r.hooks.postprocess(c)), c;
      } catch (l) {
        return o(l);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const s = "<p>An error occurred:</p><pre>" + mn(n.message + "", !0) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
}, Rs = new fm();
function Ee(e, t) {
  return Rs.parse(e, t);
}
Ee.options = Ee.setOptions = function(e) {
  return Rs.setOptions(e), Ee.defaults = Rs.defaults, rc(Ee.defaults), Ee;
}, Ee.getDefaults = Ba, Ee.defaults = $s, Ee.use = function(...e) {
  return Rs.use(...e), Ee.defaults = Rs.defaults, rc(Ee.defaults), Ee;
}, Ee.walkTokens = function(e, t) {
  return Rs.walkTokens(e, t);
}, Ee.parseInline = Rs.parseInline, Ee.Parser = Pn, Ee.parser = Pn.parse, Ee.Renderer = Wo, Ee.TextRenderer = Wa, Ee.Lexer = $n, Ee.lexer = $n.lex, Ee.Tokenizer = Vo, Ee.Hooks = Ao, Ee.parse = Ee, Ee.options, Ee.setOptions, Ee.use, Ee.walkTokens, Ee.parseInline, Pn.parse, $n.lex;
function uc(e, t) {
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
    var s, r, o, i, a = [], l = !0, c = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (s = o.call(n)).done) && (a.push(s.value), a.length !== t); l = !0) ;
    } catch (d) {
      c = !0, r = d;
    } finally {
      try {
        if (!l && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (c) throw r;
      }
    }
    return a;
  }
}
function vm() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ym(e, t) {
  return mm(e) || gm(e, t) || bm(e, t) || vm();
}
function bm(e, t) {
  if (e) {
    if (typeof e == "string") return uc(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? uc(e, t) : void 0;
  }
}
const ap = Object.entries, pc = Object.setPrototypeOf, _m = Object.isFrozen, wm = Object.getPrototypeOf, km = Object.getOwnPropertyDescriptor;
let rt = Object.freeze, lt = Object.seal, Zs = Object.create, lp = typeof Reflect < "u" && Reflect, da = lp.apply, ha = lp.construct;
rt || (rt = function(e) {
  return e;
}), lt || (lt = function(e) {
  return e;
}), da || (da = function(e, t) {
  for (var n = arguments.length, s = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++) s[r - 2] = arguments[r];
  return e.apply(t, s);
}), ha || (ha = function(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
  return new e(...n);
});
const Os = Qe(Array.prototype.forEach), xm = Qe(Array.prototype.lastIndexOf), dc = Qe(Array.prototype.pop), _r = Qe(Array.prototype.push), Sm = Qe(Array.prototype.splice), rr = Array.isArray, Ar = Qe(String.prototype.toLowerCase), Fi = Qe(String.prototype.toString), hc = Qe(String.prototype.match), wr = Qe(String.prototype.replace), fc = Qe(String.prototype.indexOf), Tm = Qe(String.prototype.trim), Am = Qe(Number.prototype.toString), Cm = Qe(Boolean.prototype.toString), mc = typeof BigInt > "u" ? null : Qe(BigInt.prototype.toString), gc = typeof Symbol > "u" ? null : Qe(Symbol.prototype.toString), It = Qe(Object.prototype.hasOwnProperty), kr = Qe(Object.prototype.toString), gt = Qe(RegExp.prototype.test), As = Em(TypeError);
function Qe(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, s = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++) s[r - 1] = arguments[r];
    return da(e, t, s);
  };
}
function Em(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++) n[s] = arguments[s];
    return ha(e, n);
  };
}
function Se(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Ar;
  if (pc && pc(e, null), !rr(t)) return e;
  let s = t.length;
  for (; s--; ) {
    let r = t[s];
    if (typeof r == "string") {
      const o = n(r);
      o !== r && (_m(t) || (t[s] = o), r = o);
    }
    e[r] = !0;
  }
  return e;
}
function Rm(e) {
  for (let t = 0; t < e.length; t++) It(e, t) || (e[t] = null);
  return e;
}
function zt(e) {
  const t = Zs(null);
  for (const s of ap(e)) {
    var n = ym(s, 2);
    const r = n[0], o = n[1];
    It(e, r) && (rr(o) ? t[r] = Rm(o) : o && typeof o == "object" && o.constructor === Object ? t[r] = zt(o) : t[r] = o);
  }
  return t;
}
function Om(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Am(e);
    case "boolean":
      return Cm(e);
    case "bigint":
      return mc ? mc(e) : "0";
    case "symbol":
      return gc ? gc(e) : "Symbol()";
    case "undefined":
      return kr(e);
    case "function":
    case "object": {
      if (e === null) return kr(e);
      const t = e, n = Gt(t, "toString");
      if (typeof n == "function") {
        const s = n(t);
        return typeof s == "string" ? s : kr(s);
      }
      return kr(e);
    }
    default:
      return kr(e);
  }
}
function Gt(e, t) {
  for (; e !== null; ) {
    const s = km(e, t);
    if (s) {
      if (s.get) return Qe(s.get);
      if (typeof s.value == "function") return Qe(s.value);
    }
    e = wm(e);
  }
  function n() {
    return null;
  }
  return n;
}
function Im(e) {
  try {
    return gt(e, ""), !0;
  } catch {
    return !1;
  }
}
const vc = rt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Bi = rt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), zi = rt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Lm = rt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Mi = rt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Nm = rt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), yc = rt(["#text"]), bc = rt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Ui = rt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "pointer-events", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "vector-effect", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), _c = rt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), go = rt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Dm = lt(/{{[\w\W]*|^[\w\W]*}}/g), $m = lt(/<%[\w\W]*|^[\w\W]*%>/g), Pm = lt(/\${[\w\W]*/g), Fm = lt(/^data-[\-\w.\u00B7-\uFFFF]+$/), Bm = lt(/^aria-[\-\w]+$/), wc = lt(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), zm = lt(/^(?:\w+script|data):/i), Mm = lt(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), Um = lt(/^html$/i), jm = lt(/^[a-z][.\w]*(-[.\w]+)+$/i), kc = lt(/<[/\w!]/g), xc = lt(/<[/\w]/g), qm = lt(/<\/no(script|embed|frames)/i), Hm = lt(/\/>/i), Ft = { element: 1, attribute: 2, text: 3, cdataSection: 4, entityReference: 5, entityNode: 6, processingInstruction: 7, comment: 8, document: 9, documentType: 10, documentFragment: 11, notation: 12 }, cp = ["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"], Vm = rt(Se({}, cp)), Wm = function() {
  const e = {};
  return Os(cp, (t) => {
    e[t] = lt(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), rt(e);
}(), Km = function() {
  return typeof window > "u" ? null : window;
}, Gm = function(e, t) {
  if (typeof e != "object" || typeof e.createPolicy != "function") return null;
  let n = null;
  const s = "data-tt-policy-suffix";
  t && t.hasAttribute(s) && (n = t.getAttribute(s));
  const r = "dompurify" + (n ? "#" + n : "");
  try {
    return e.createPolicy(r, { createHTML(o) {
      return o;
    }, createScriptURL(o) {
      return o;
    } });
  } catch {
    return console.warn("TrustedTypes policy " + r + " could not be created."), null;
  }
}, Sc = function() {
  return { afterSanitizeAttributes: [], afterSanitizeElements: [], afterSanitizeShadowDOM: [], beforeSanitizeAttributes: [], beforeSanitizeElements: [], beforeSanitizeShadowDOM: [], uponSanitizeAttribute: [], uponSanitizeElement: [], uponSanitizeShadowNode: [] };
}, ns = function(e, t, n, s) {
  return It(e, t) && rr(e[t]) ? Se(s.base ? zt(s.base) : {}, e[t], s.transform) : n;
}, ji = function(e, t, n) {
  const s = It(e, t) ? e[t] : void 0;
  return s && typeof s == "object" ? zt(s) : n();
};
function up() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Km();
  const t = (u) => up(u);
  if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== Ft.document || !e.Element) return t.isSupported = !1, t;
  let n = e.document;
  const s = n, r = s.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, i = e.Node, a = e.Element, l = e.NodeFilter;
  e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const d = e.DOMParser, _ = e.trustedTypes, w = a.prototype, k = Gt(w, "cloneNode"), C = Gt(w, "remove"), M = Gt(w, "removeAttributeNode"), K = Gt(w, "nextSibling"), x = Gt(w, "childNodes"), G = Gt(w, "parentNode"), Z = Gt(w, "shadowRoot"), E = Gt(w, "attributes"), U = i && i.prototype ? Gt(i.prototype, "nodeType") : null, T = i && i.prototype ? Gt(i.prototype, "nodeName") : null, J = i && i.prototype ? Gt(i.prototype, "ownerDocument") : null, se = function(u) {
    return U ? U(u) : u.nodeType;
  }, ie = function(u) {
    return T ? T(u) : u.nodeName;
  };
  if (typeof o == "function") {
    const u = n.createElement("template");
    u.content && u.content.ownerDocument && (n = u.content.ownerDocument);
  }
  let ce, Ce = "", Ke, ot = !1, Xe = 0;
  const Ne = function() {
    if (Xe > 0) throw As('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, ge = function(u) {
    Ne(), Xe++;
    try {
      return ce.createHTML(u);
    } finally {
      Xe--;
    }
  }, ye = function(u) {
    Ne(), Xe++;
    try {
      return ce.createScriptURL(u);
    } finally {
      Xe--;
    }
  }, ft = function() {
    return ot || (Ke = Gm(_, r), ot = !0), Ke;
  }, Et = n, mt = Et.implementation, _t = Et.createNodeIterator, Ge = Et.createDocumentFragment, jn = Et.getElementsByTagName, kn = s.importNode;
  let Re = Sc();
  t.isSupported = typeof ap == "function" && typeof G == "function" && mt && mt.createHTMLDocument !== void 0;
  const ct = Dm, an = $m, xn = Pm, qn = Fm, Xt = Bm, g = zm, y = Mm, I = jm;
  let B = wc, L = null;
  const $ = Se({}, [...vc, ...Bi, ...zi, ...Mi, ...yc]);
  let F = null;
  const j = Se({}, [...bc, ...Ui, ..._c, ...go]);
  let z = Object.seal(Zs(null, { tagNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, allowCustomizedBuiltInElements: { writable: !0, configurable: !1, enumerable: !0, value: !1 } })), P = null, ee = null;
  const H = Object.seal(Zs(null, { tagCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeCheck: { writable: !0, configurable: !1, enumerable: !0, value: null } }));
  let re = !0, X = !0, he = !1, D = !0, R = !1, Q = !0, le = !1, xe = !1, Te = null, et = null, tt = !1, De = !1, Ye = !1, Ut = !1, ln = !0, en = !1;
  const Sn = "user-content-";
  let Ps = !0, Fs = !1, Tn = {}, tn = null;
  const wt = Se({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "selectedcontent", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let Gr = null;
  const Yr = Se({}, ["audio", "video", "img", "source", "image", "track"]);
  let Hn = null;
  const Zr = Se({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Rt = "http://www.w3.org/1998/Math/MathML", kt = "http://www.w3.org/2000/svg", Lt = "http://www.w3.org/1999/xhtml";
  let ut = Lt, Vn = !1, Wn = null;
  const fs = Se({}, [Rt, kt, Lt], Fi), Jr = rt(["mi", "mo", "mn", "ms", "mtext"]);
  let An = Se({}, Jr);
  const nn = rt(["annotation-xml"]);
  let Nt = Se({}, nn);
  const Qr = Se({}, ["title", "style", "font", "a", "script"]);
  let qe = null;
  const fi = ["application/xhtml+xml", "text/html"], Xr = "text/html";
  let Ae = null, Kn = null;
  const ms = n.createElement("form"), Bs = function(u) {
    return u instanceof RegExp || u instanceof Function;
  }, ar = function() {
    let u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Kn && Kn === u) return;
    (!u || typeof u != "object") && (u = {}), u = zt(u), qe = fi.indexOf(u.PARSER_MEDIA_TYPE) === -1 ? Xr : u.PARSER_MEDIA_TYPE, Ae = qe === "application/xhtml+xml" ? Fi : Ar, L = ns(u, "ALLOWED_TAGS", $, { transform: Ae }), F = ns(u, "ALLOWED_ATTR", j, { transform: Ae }), Wn = ns(u, "ALLOWED_NAMESPACES", fs, { transform: Fi }), Hn = ns(u, "ADD_URI_SAFE_ATTR", Zr, { transform: Ae, base: Zr }), Gr = ns(u, "ADD_DATA_URI_TAGS", Yr, { transform: Ae, base: Yr }), tn = ns(u, "FORBID_CONTENTS", wt, { transform: Ae }), P = ns(u, "FORBID_TAGS", zt({}), { transform: Ae }), ee = ns(u, "FORBID_ATTR", zt({}), { transform: Ae }), Tn = It(u, "USE_PROFILES") ? u.USE_PROFILES && typeof u.USE_PROFILES == "object" ? zt(u.USE_PROFILES) : u.USE_PROFILES : !1, re = u.ALLOW_ARIA_ATTR !== !1, X = u.ALLOW_DATA_ATTR !== !1, he = u.ALLOW_UNKNOWN_PROTOCOLS || !1, D = u.ALLOW_SELF_CLOSE_IN_ATTR !== !1, R = u.SAFE_FOR_TEMPLATES || !1, Q = u.SAFE_FOR_XML !== !1, le = u.WHOLE_DOCUMENT || !1, De = u.RETURN_DOM || !1, Ye = u.RETURN_DOM_FRAGMENT || !1, Ut = u.RETURN_TRUSTED_TYPE || !1, tt = u.FORCE_BODY || !1, ln = u.SANITIZE_DOM !== !1, en = u.SANITIZE_NAMED_PROPS || !1, Ps = u.KEEP_CONTENT !== !1, Fs = u.IN_PLACE || !1, B = Im(u.ALLOWED_URI_REGEXP) ? u.ALLOWED_URI_REGEXP : wc, ut = typeof u.NAMESPACE == "string" ? u.NAMESPACE : Lt, An = ji(u, "MATHML_TEXT_INTEGRATION_POINTS", () => Se({}, Jr)), Nt = ji(u, "HTML_INTEGRATION_POINTS", () => Se({}, nn));
    const A = ji(u, "CUSTOM_ELEMENT_HANDLING", () => Zs(null));
    if (z = Zs(null), It(A, "tagNameCheck") && Bs(A.tagNameCheck) && (z.tagNameCheck = A.tagNameCheck), It(A, "attributeNameCheck") && Bs(A.attributeNameCheck) && (z.attributeNameCheck = A.attributeNameCheck), It(A, "allowCustomizedBuiltInElements") && typeof A.allowCustomizedBuiltInElements == "boolean" && (z.allowCustomizedBuiltInElements = A.allowCustomizedBuiltInElements), lt(z), R && (X = !1), Ye && (De = !0), Tn && (L = Se({}, yc), F = Zs(null), Tn.html === !0 && (Se(L, vc), Se(F, bc)), Tn.svg === !0 && (Se(L, Bi), Se(F, Ui), Se(F, go)), Tn.svgFilters === !0 && (Se(L, zi), Se(F, Ui), Se(F, go)), Tn.mathMl === !0 && (Se(L, Mi), Se(F, _c), Se(F, go))), H.tagCheck = null, H.attributeCheck = null, It(u, "ADD_TAGS") && (typeof u.ADD_TAGS == "function" ? H.tagCheck = u.ADD_TAGS : rr(u.ADD_TAGS) && (L === $ && (L = zt(L)), Se(L, u.ADD_TAGS, Ae))), It(u, "ADD_ATTR") && (typeof u.ADD_ATTR == "function" ? H.attributeCheck = u.ADD_ATTR : rr(u.ADD_ATTR) && (F === j && (F = zt(F)), Se(F, u.ADD_ATTR, Ae))), It(u, "ADD_FORBID_CONTENTS") && rr(u.ADD_FORBID_CONTENTS) && (tn === wt && (tn = zt(tn)), Se(tn, u.ADD_FORBID_CONTENTS, Ae)), Ps && (L["#text"] = !0), le && Se(L, ["html", "head", "body"]), L.table && (Se(L, ["tbody"]), delete P.tbody), u.TRUSTED_TYPES_POLICY) {
      if (typeof u.TRUSTED_TYPES_POLICY.createHTML != "function") throw As('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof u.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw As('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const O = ce;
      ce = u.TRUSTED_TYPES_POLICY;
      try {
        Ce = ge("");
      } catch (V) {
        throw ce = O, V;
      }
    } else u.TRUSTED_TYPES_POLICY === null ? (ce = void 0, Ce = "") : (ce === void 0 && (ce = ft()), ce && typeof Ce == "string" && (Ce = ge("")));
    rt && rt(u), Kn = u;
  }, gs = Se({}, [...Bi, ...zi, ...Lm]), lr = Se({}, [...Mi, ...Nm]), eo = function(u, A, O) {
    return A.namespaceURI === Lt ? u === "svg" : A.namespaceURI === Rt ? u === "svg" && (O === "annotation-xml" || An[O]) : !!gs[u];
  }, to = function(u, A, O) {
    return A.namespaceURI === Lt ? u === "math" : A.namespaceURI === kt ? u === "math" && Nt[O] : !!lr[u];
  }, no = function(u, A, O) {
    return A.namespaceURI === kt && !Nt[O] || A.namespaceURI === Rt && !An[O] ? !1 : !lr[u] && (Qr[u] || !gs[u]);
  }, so = function(u) {
    let A = G(u);
    (!A || !A.tagName) && (A = { namespaceURI: ut, tagName: "template" });
    const O = Ar(u.tagName), V = Ar(A.tagName);
    return Wn[u.namespaceURI] ? u.namespaceURI === kt ? eo(O, A, V) : u.namespaceURI === Rt ? to(O, A, V) : u.namespaceURI === Lt ? no(O, A, V) : !!(qe === "application/xhtml+xml" && Wn[u.namespaceURI]) : !1;
  }, cn = function(u) {
    _r(t.removed, { element: u });
    try {
      G(u).removeChild(u);
    } catch {
      if (C(u), !G(u)) throw As("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, ro = function(u, A, O) {
    try {
      M(u, A);
    } catch {
      try {
        u.removeAttribute(O);
      } catch {
      }
    }
  }, Gn = function(u) {
    vs(u);
    const A = x(u);
    if (A) {
      const V = [];
      Os(A, (oe) => {
        _r(V, oe);
      }), Os(V, (oe) => {
        try {
          C(oe);
        } catch {
        }
      });
    }
    const O = E(u);
    if (O) for (let V = O.length - 1; V >= 0; --V) {
      const oe = O[V], de = oe && oe.name;
      typeof de == "string" && ro(u, oe, de);
    }
  }, jt = function(u, A, O) {
    if (!O) try {
      O = A.getAttributeNode(u);
    } catch {
      O = null;
    }
    _r(t.removed, { attribute: O || null, from: A });
    try {
      O ? M(A, O) : A.removeAttribute(u);
    } catch {
      try {
        A.removeAttribute(u);
      } catch {
      }
    }
    if (u === "is") if (De || Ye) try {
      cn(A);
    } catch {
    }
    else try {
      A.setAttribute(u, "");
    } catch {
    }
  }, oo = function(u) {
    const A = E(u);
    if (A) for (let O = A.length - 1; O >= 0; --O) {
      const V = A[O], oe = V && V.name;
      typeof oe != "string" || F[Ae(oe)] || ro(u, V, oe);
    }
  }, vs = function(u) {
    const A = [u];
    for (; A.length > 0; ) {
      const O = A.pop();
      se(O) === Ft.element && oo(O);
      const V = x(O);
      if (V) for (let oe = V.length - 1; oe >= 0; --oe) A.push(V[oe]);
    }
  }, un = function(u, A) {
    return Q ? u === "patchsrc" ? !0 : u === "for" && A !== "label" && A !== "output" : !1;
  }, ys = function(u) {
    if (!Q) return;
    const A = [u];
    for (; A.length > 0; ) {
      const O = A.pop(), V = se(O);
      if (V === Ft.processingInstruction || V === Ft.comment && gt(xc, O.data)) {
        try {
          C(O);
        } catch {
        }
        continue;
      }
      if (V === Ft.element) {
        const de = O, be = Ae(ie(O));
        try {
          de.hasAttribute && de.hasAttribute("patchsrc") && de.removeAttribute("patchsrc"), de.hasAttribute && de.hasAttribute("for") && un("for", be) && de.removeAttribute("for");
        } catch {
        }
      }
      const oe = x(O);
      if (oe) for (let de = oe.length - 1; de >= 0; --de) A.push(oe[de]);
    }
  }, zs = function(u) {
    let A = null, O = null;
    if (tt) u = "<remove></remove>" + u;
    else {
      const de = hc(u, /^[\r\n\t ]+/);
      O = de && de[0];
    }
    qe === "application/xhtml+xml" && ut === Lt && (u = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + u + "</body></html>");
    const V = ce ? ge(u) : u;
    if (ut === Lt) try {
      A = new d().parseFromString(V, qe);
    } catch {
    }
    if (!A || !A.documentElement) {
      A = mt.createDocument(ut, "template", null);
      try {
        A.documentElement.innerHTML = Vn ? Ce : V;
      } catch {
      }
    }
    const oe = A.body || A.documentElement;
    return u && O && oe.insertBefore(n.createTextNode(O), oe.childNodes[0] || null), ut === Lt ? jn.call(A, le ? "html" : "body")[0] : le ? A.documentElement : oe;
  }, Ms = function(u) {
    const A = J ? J(u) : u.ownerDocument;
    return _t.call(A || u, u, l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION, null);
  }, Cn = function(u) {
    return u = wr(u, ct, " "), u = wr(u, an, " "), u = wr(u, xn, " "), u;
  }, qt = function(u) {
    var A;
    u.normalize();
    const O = J ? J(u) : u.ownerDocument, V = _t.call(O || u, u, l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION, null);
    let oe = V.nextNode();
    for (; oe; ) oe.data = Cn(oe.data), oe = V.nextNode();
    const de = (A = u.querySelectorAll) === null || A === void 0 ? void 0 : A.call(u, "template");
    de && Os(de, (be) => {
      sn(be.content) && qt(be.content);
    });
  }, Yn = function(u) {
    const A = T ? T(u) : null;
    return typeof A != "string" || Ae(A) !== "form" ? !1 : typeof u.nodeName != "string" || typeof u.textContent != "string" || typeof u.removeChild != "function" || u.attributes !== E(u) || typeof u.removeAttribute != "function" || typeof u.removeAttributeNode != "function" || typeof u.getAttributeNode != "function" || typeof u.setAttribute != "function" || typeof u.namespaceURI != "string" || typeof u.insertBefore != "function" || typeof u.hasChildNodes != "function" || u.nodeType !== U(u) || u.childNodes !== x(u);
  }, sn = function(u) {
    if (!U || typeof u != "object" || u === null) return !1;
    try {
      return U(u) === Ft.documentFragment;
    } catch {
      return !1;
    }
  }, Zn = function(u) {
    if (!U || typeof u != "object" || u === null) return !1;
    try {
      return typeof U(u) == "number";
    } catch {
      return !1;
    }
  };
  function it(u, A, O) {
    u.length !== 0 && Os(u, (V) => {
      V.call(t, A, O, Kn);
    });
  }
  const mi = function(u, A) {
    return !!(Q && u.hasChildNodes() && !Zn(u.firstElementChild) && gt(kc, u.textContent) && gt(kc, u.innerHTML) || Q && u.namespaceURI === Lt && Vm[A] && (Zn(u.firstElementChild) || typeof u.textContent == "string" && gt(Wm[A], u.textContent)) || u.nodeType === Ft.processingInstruction || Q && u.nodeType === Ft.comment && gt(xc, u.data));
  }, pn = function(u, A) {
    if (u instanceof RegExp) return gt(u, A);
    if (u instanceof Function) {
      for (var O = arguments.length, V = new Array(O > 2 ? O - 2 : 0), oe = 2; oe < O; oe++) V[oe - 2] = arguments[oe];
      return !!u(A, ...V);
    }
    return !1;
  }, io = function(u, A, O) {
    if (!P[A] && Dt(A) && pn(z.tagNameCheck, A)) return !1;
    if (Ps && !tn[A]) {
      const V = G(u), oe = x(u);
      if (oe && V) {
        const de = oe.length;
        for (let be = de - 1; be >= 0; --be) {
          const Wt = u === O ? k(oe[be], !0) : oe[be];
          V.insertBefore(Wt, K(u));
        }
      }
    }
    return cn(u), !0;
  }, ao = function(u, A, O, V) {
    return u.length === 0 ? A : A === O || A === V ? zt(A) : A;
  }, cr = function(u, A) {
    return u === A || G(u) !== null ? !1 : (Fs && vs(u), !0);
  }, bs = function(u, A) {
    if (it(Re.beforeSanitizeElements, u, null), cr(u, A)) return !0;
    if (Yn(u)) return cn(u), !0;
    const O = Ae(ie(u));
    if (L = ao(Re.uponSanitizeElement, L, $, Te), it(Re.uponSanitizeElement, u, { tagName: O, allowedTags: L }), cr(u, A)) return !0;
    if (mi(u, O)) return cn(u), !0;
    if (P[O] || !(H.tagCheck instanceof Function && H.tagCheck(O)) && !L[O]) {
      const V = io(u, O, A);
      return V === !1 && it(Re.afterSanitizeElements, u, null), V;
    }
    if (se(u) === Ft.element && !so(u) || (O === "noscript" || O === "noembed" || O === "noframes") && gt(qm, u.innerHTML)) return cn(u), !0;
    if (R && u.nodeType === Ft.text) {
      const V = Cn(u.textContent);
      u.textContent !== V && (_r(t.removed, { element: u.cloneNode() }), u.textContent = V);
    }
    return it(Re.afterSanitizeElements, u, null), !1;
  }, Us = function(u, A, O) {
    if (ee[A] || un(A, u) || ln && (A === "id" || A === "name") && (O in n || O in ms)) return !1;
    const V = F[A] || H.attributeCheck instanceof Function && H.attributeCheck(A, u);
    return X && gt(qn, A) || re && gt(Xt, A) ? !0 : V ? Hn[A] || gt(B, wr(O, y, "")) || (A === "src" || A === "xlink:href" || A === "href") && u !== "script" && fc(O, "data:") === 0 && Gr[u] || he && !gt(g, wr(O, y, "")) ? !0 : !O : Dt(u) && pn(z.tagNameCheck, u) && pn(z.attributeNameCheck, A, u) || A === "is" && z.allowCustomizedBuiltInElements && pn(z.tagNameCheck, O);
  }, Ht = Se({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), Dt = function(u) {
    return !Ht[Ar(u)] && gt(I, u);
  }, He = function(u, A, O, V) {
    if (ce && typeof _ == "object" && typeof _.getAttributeType == "function" && !O) switch (_.getAttributeType(u, A)) {
      case "TrustedHTML":
        return ge(V);
      case "TrustedScriptURL":
        return ye(V);
    }
    return V;
  }, nt = function(u, A, O, V) {
    try {
      return O ? u.setAttributeNS(O, A, V) : u.setAttribute(A, V), Yn(u) ? (cn(u), !1) : !0;
    } catch {
      return jt(A, u), !1;
    }
  }, je = function(u) {
    it(Re.beforeSanitizeAttributes, u, null);
    const A = u.attributes;
    if (!A || Yn(u)) return;
    F = ao(Re.uponSanitizeAttribute, F, j, et);
    const O = { attrName: "", attrValue: "", keepAttr: !0, allowedAttributes: F, forceKeepAttr: void 0 };
    let V = A.length;
    const oe = Ae(u.nodeName);
    for (; V--; ) {
      const de = A[V], be = de.name, Wt = de.namespaceURI, dn = de.value, at = Ae(be), $t = dn;
      let pt = be === "value" ? $t : Tm($t), dt = !1;
      if (O.attrName = at, O.attrValue = pt, O.keepAttr = !0, O.forceKeepAttr = void 0, it(Re.uponSanitizeAttribute, u, O), pt = O.attrValue, en && (at === "id" || at === "name") && fc(pt, Sn) !== 0 && (jt(be, u, de), pt = Sn + pt, dt = !0), Q && gt(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, pt)) {
        jt(be, u, de);
        continue;
      }
      if (at === "attributename" && hc(pt, "href")) {
        jt(be, u, de);
        continue;
      }
      if (!O.forceKeepAttr) {
        if (!O.keepAttr) {
          jt(be, u, de);
          continue;
        }
        if (!D && gt(Hm, pt)) {
          jt(be, u, de);
          continue;
        }
        if (R && (pt = Cn(pt)), !Us(oe, at, pt)) {
          jt(be, u, de);
          continue;
        }
        pt = He(oe, at, Wt, pt), pt !== $t && nt(u, be, Wt, pt) && dt && dc(t.removed);
      }
    }
    it(Re.afterSanitizeAttributes, u, null);
  }, Vt = function(u) {
    let A = null;
    const O = Ms(u);
    for (it(Re.beforeSanitizeShadowDOM, u, null); A = O.nextNode(); ) if (it(Re.uponSanitizeShadowNode, A, null), bs(A, u), je(A), sn(A.content) && Vt(A.content), se(A) === Ft.element) {
      const V = Z(A);
      sn(V) && (En(V), Vt(V));
    }
    it(Re.afterSanitizeShadowDOM, u, null);
  }, En = function(u) {
    const A = [{ node: u, shadow: null }];
    for (; A.length > 0; ) {
      const O = A.pop();
      if (O.shadow) {
        Vt(O.shadow);
        continue;
      }
      const V = O.node, oe = se(V) === Ft.element, de = x(V);
      if (de) for (let be = de.length - 1; be >= 0; --be) A.push({ node: de[be], shadow: null });
      if (oe) {
        const be = T ? T(V) : null;
        if (typeof be == "string" && Ae(be) === "template") {
          const Wt = V.content;
          sn(Wt) && A.push({ node: Wt, shadow: null });
        }
      }
      if (oe) {
        const be = Z(V);
        sn(be) && A.push({ node: null, shadow: be }, { node: be, shadow: null });
      }
    }
  };
  return t.sanitize = function(u) {
    let A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, O = null, V = null, oe = null, de = null;
    if (Vn = !u, Vn && (u = "<!-->"), typeof u != "string" && !Zn(u) && (u = Om(u), typeof u != "string")) throw As("dirty is not a string, aborting");
    if (!t.isSupported) return u;
    xe ? (L = Te, F = et) : ar(A), (Re.uponSanitizeElement.length > 0 || Re.uponSanitizeAttribute.length > 0) && (L = zt(L)), Re.uponSanitizeAttribute.length > 0 && (F = zt(F)), t.removed = [];
    const be = Fs && typeof u != "string" && Zn(u);
    if (be) {
      ys(u);
      const at = ie(u);
      if (typeof at == "string") {
        const $t = Ae(at);
        if (!L[$t] || P[$t]) throw Gn(u), As("root node is forbidden and cannot be sanitized in-place");
      }
      if (Yn(u)) throw Gn(u), As("root node is clobbered and cannot be sanitized in-place");
      try {
        En(u);
      } catch ($t) {
        throw Gn(u), $t;
      }
    } else if (Zn(u)) O = zs("<!---->"), V = O.ownerDocument.importNode(u, !0), V.nodeType === Ft.element && V.nodeName === "BODY" || V.nodeName === "HTML" ? O = V : O.appendChild(V), En(O);
    else {
      if (!De && !R && !le && u.indexOf("<") === -1) return ce && Ut ? ge(u) : u;
      if (O = zs(u), !O) return De ? null : Ut ? Ce : "";
    }
    O && tt && cn(O.firstChild);
    const Wt = be ? u : O;
    try {
      const at = Ms(Wt);
      for (; oe = at.nextNode(); ) bs(oe, Wt), je(oe), sn(oe.content) && Vt(oe.content);
    } catch (at) {
      throw be && (Gn(u), Os(t.removed, ($t) => {
        $t.element && vs($t.element);
      })), at;
    }
    if (be) return Os(t.removed, (at) => {
      at.element && vs(at.element);
    }), R && qt(u), u;
    if (De) {
      if (R && qt(O), Ye) for (de = Ge.call(O.ownerDocument); O.firstChild; ) de.appendChild(O.firstChild);
      else de = O;
      return (F.shadowroot || F.shadowrootmode) && (de = kn.call(s, de, !0)), de;
    }
    let dn = le ? O.outerHTML : O.innerHTML;
    return le && L["!doctype"] && O.ownerDocument && O.ownerDocument.doctype && O.ownerDocument.doctype.name && gt(Um, O.ownerDocument.doctype.name) && (dn = "<!DOCTYPE " + O.ownerDocument.doctype.name + `>
` + dn), R && (dn = Cn(dn)), ce && Ut ? ge(dn) : dn;
  }, t.setConfig = function() {
    let u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ar(u), xe = !0, Te = L, et = F;
  }, t.clearConfig = function() {
    Kn = null, xe = !1, Te = null, et = null, ce = Ke, Ce = "";
  }, t.isValidAttribute = function(u, A, O) {
    Kn || ar({});
    const V = Ae(u), oe = Ae(A);
    return Us(V, oe, O);
  }, t.addHook = function(u, A) {
    typeof A == "function" && It(Re, u) && _r(Re[u], A);
  }, t.removeHook = function(u, A) {
    if (It(Re, u)) {
      if (A !== void 0) {
        const O = xm(Re[u], A);
        return O === -1 ? void 0 : Sm(Re[u], O, 1)[0];
      }
      return dc(Re[u]);
    }
  }, t.removeHooks = function(u) {
    It(Re, u) && (Re[u] = []);
  }, t.removeAllHooks = function() {
    Re = Sc();
  }, t;
}
var fa = up();
fa.addHook("uponSanitizeElement", (e, t) => {
  var r, o, i, a, l;
  if (t.tagName === "svg") {
    (r = e.parentNode) == null || r.removeChild(e);
    return;
  }
  if (t.tagName === "math") {
    (o = e.parentNode) == null || o.removeChild(e);
    return;
  }
  if (t.tagName === "foreignobject") {
    (i = e.parentNode) == null || i.removeChild(e);
    return;
  }
  const n = e, s = (a = t.tagName) == null ? void 0 : a.toUpperCase();
  (s === "IMG" || s === "AREA" || s === "MAP") && ((l = n.parentNode) == null || l.removeChild(n));
}), fa.addHook("afterSanitizeAttributes", (e) => {
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
  const t = { FORBID_TAGS: ["iframe", "frame", "frameset", "object", "embed", "applet", "script", "base", "link", "meta", "style", "svg", "math", "form", "input", "button", "textarea", "select", "option", "xml", "xss", "import", "video", "audio", "track", "source", "canvas", "details", "template", "slot", "noscript", "marquee", "bgsound", "keygen", "command", "img", "area", "map"], FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onmouseout", "onmousemove", "onkeydown", "onkeyup", "onkeypress", "onfocus", "onblur", "onchange", "onsubmit", "ondblclick", "oncontextmenu", "oninput", "oninvalid", "onreset", "onsearch", "onselect", "onabort", "oncanplay", "oncanplaythrough", "oncuechange", "ondurationchange", "onemptied", "onended", "onloadeddata", "onloadedmetadata", "onloadstart", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onseeked", "onseeking", "onstalled", "onsuspend", "ontimeupdate", "onvolumechange", "onwaiting", "ontoggle", "onauxclick", "ongotpointercapture", "onlostpointercapture", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onwheel", "onanimationcancel", "onanimationend", "onanimationiteration", "onanimationstart", "ontransitioncancel", "ontransitionend", "ontransitionrun", "ontransitionstart", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "oncopy", "oncut", "onpaste", "onscroll", "onmessage", "onmouseenter", "onmouseleave", "onmousewheel", "onbeforeunload", "onerrorupdate", "onhelp", "onmove", "onreadystatechange", "onresize", "onstart", "onstop", "onunload", "onactivate", "onafterprint", "onafterupdate", "onbeforeactivate", "onbeforecopy", "onbeforecut", "onbeforedeactivate", "onbeforeeditfocus", "onbeforepaste", "onbeforeprint", "onbeforeupdate", "onbounce", "oncellchange", "oncontrolselect", "ondataavailable", "ondatasetchanged", "ondatasetcomplete", "ondeactivate", "onfilterchange", "onfinish", "onfocusin", "onfocusout", "onlayoutcomplete", "onlosecapture", "onmoveend", "onmovestart", "onpropertychange", "onresizeend", "onresizestart", "onrowenter", "onrowexit", "onrowsdelete", "onrowsinserted", "onselectionchange", "onselectstart", "onshow", "onsort", "onpointerrawupdate", "formaction", "action", "form", "srcdoc", "srcset", "dynsrc", "lowsrc", "ping", "poster", "background", "code", "codebase", "archive", "profile", "xmlns", "xlink:href", "attributename", "from", "to", "values", "begin", "autofocus", "autoplay", "controls", "manifest", "sandbox", "src", "data"], ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i, ALLOWED_TAGS: ["a", "b", "i", "u", "strong", "em", "p", "br", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "span", "div", "del", "hr", "sup", "sub", "abbr", "cite", "dfn", "kbd", "mark", "q", "samp", "small", "time", "var"], ALLOWED_ATTR: ["href", "target", "rel", "title", "class", "id", "align", "colspan", "rowspan"], RETURN_DOM: !1, RETURN_DOM_FRAGMENT: !1, ALLOW_DATA_ATTR: !1 };
  return fa.sanitize(e, t);
}
Ee.setOptions({ renderer: new Ee.Renderer(), gfm: !0, breaks: !0 });
const Co = (e) => Ym(Ee(e || "")), Tc = "*", Zm = /* @__PURE__ */ new Set(["null", "about:blank", ""]);
let Yt = null;
const Fr = (e) => e && !Zm.has(e) ? e : null, Jm = (e) => {
  if (!e) return null;
  try {
    return Fr(new URL(e).origin);
  } catch {
    return null;
  }
};
function pp() {
  if (Yt) return Yt;
  if (window.parent === window) return Yt = Fr(window.location.origin) || Tc, Yt;
  try {
    const e = Fr(window.parent.location.origin);
    if (e) return Yt = e, Yt;
  } catch {
  }
  try {
    const e = window.location.ancestorOrigins, t = e && e.length ? Fr(e[0]) : null;
    if (t) return Yt = t, Yt;
  } catch {
  }
  return Yt = Jm(document.referrer) || Tc, Yt;
}
function Ac(e) {
  Yt = Fr(e) || Yt;
}
function st(e) {
  window.parent.postMessage(e, pp());
}
const Ko = "Start a new chat", Cc = "Start a new chat? This ends the current one.", Qm = "Start new chat", Xm = "Cancel", Ec = "Couldn't start a new chat. Please try again.", eg = 15e3, tg = ["aria-label"], ng = { class: "new-chat-confirm__question" }, sg = { class: "new-chat-confirm__actions" }, rg = ["disabled"], og = ["disabled"], ig = zn({ __name: "NewChatConfirm", props: { error: {}, busy: { type: Boolean } }, emits: ["confirm", "cancel"], setup(e, { emit: t }) {
  const n = t;
  return (s, r) => (v(), b("div", { class: "new-chat-confirm", role: "alertdialog", "aria-live": "polite", "aria-label": S(Cc) }, [m("p", ng, q(s.error || S(Cc)), 1), m("div", sg, [m("button", { type: "button", class: "new-chat-confirm__button", disabled: s.busy, onClick: r[0] || (r[0] = (o) => n("cancel")) }, q(S(Xm)), 9, rg), m("button", { type: "button", class: "new-chat-confirm__button new-chat-confirm__button--primary", disabled: s.busy, onClick: r[1] || (r[1] = (o) => n("confirm")) }, q(S(Qm)), 9, og)])], 8, tg));
} }), Un = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t) n[s] = r;
  return n;
}, dp = Un(ig, [["__scopeId", "data-v-6c78f353"]]), ag = { class: "askai" }, lg = { class: "askai__bar" }, cg = ["value", "placeholder", "disabled", "aria-label", "onKeydown"], ug = ["disabled", "title", "aria-label", "aria-expanded"], pg = { class: "askai__intro" }, dg = { class: "askai__title" }, hg = { key: 0, class: "askai__subtitle" }, fg = { key: 0, class: "askai__suggestions" }, mg = ["disabled", "onClick"], gg = ["aria-live"], vg = { key: 0, class: "askai__question" }, yg = { key: 1, class: "askai__system" }, bg = ["innerHTML"], _g = { key: 0, class: "askai__sources" }, wg = ["title"], kg = { key: 0, class: "askai__thinking", role: "status", "aria-live": "polite" }, xg = { class: "askai__thinking-text" }, Sg = { key: 1, class: "askai__foot" }, Tg = { key: 0 }, Ag = { key: 1, class: "askai__brand", href: "https://chattermate.chat", target: "_blank", rel: "noopener noreferrer" }, Cg = zn({ __name: "AskAiPanel", props: { messages: {}, draft: {}, agentName: {}, suggestions: {}, welcomeTitle: {}, welcomeSubtitle: {}, placeholder: {}, inputEnabled: { type: Boolean }, typingEnabled: { type: Boolean }, loading: { type: Boolean }, showCitations: { type: Boolean }, disclaimer: {}, showBranding: { type: Boolean }, active: { type: Boolean }, hotkey: { type: Boolean }, citationLabel: { type: Function }, citationTooltip: { type: Function }, displayText: { type: Function }, isStreaming: { type: Function }, canStartNewChat: { type: Boolean }, startingNewChat: { type: Boolean }, newChatArmed: { type: Boolean }, newChatError: {} }, emits: ["update:draft", "send", "ask", "close", "newChat", "confirmNewChat", "cancelNewChat"], setup(e, { emit: t }) {
  const n = e, s = t, r = te(null), o = te(null), i = te(null), a = ["user", "bot", "agent", "system"], l = ne(() => n.messages.map((E, U) => ({ message: E, index: U })).filter(({ message: E }) => a.includes(E.message_type))), c = ne(() => l.value.length > 0), d = (E) => {
    s("update:draft", E.target.value);
  }, _ = () => {
    !(n.typingEnabled ?? n.inputEnabled) || !n.draft.trim() || s("send");
  }, w = (E) => {
    n.inputEnabled && s("ask", E);
  }, k = typeof navigator < "u" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || ""), C = (E) => {
    if (E.key === "Escape") {
      E.preventDefault(), s("close");
      return;
    }
    const U = k ? E.metaKey && !E.ctrlKey : E.ctrlKey && !E.metaKey;
    n.hotkey && U && !E.altKey && (E.key === "k" || E.key === "K") && (E.preventDefault(), s("close"));
  }, M = () => {
    os(() => {
      var E;
      return (E = r.value) == null ? void 0 : E.focus();
    });
  };
  let K = 0;
  const x = () => {
    if (!i.value) return;
    const E = i.value.closest(".askai"), U = o.value;
    if (!E || !U) return;
    const T = E.offsetHeight - U.offsetHeight, J = getComputedStyle(U), se = parseFloat(J.paddingTop) + parseFloat(J.paddingBottom), ie = Math.ceil(T + se + i.value.getBoundingClientRect().height);
    Math.abs(ie - K) < 3 || (K = ie, st({ type: "WIDGET_RESIZE", height: ie }));
  };
  let G = null;
  const Z = ne(() => l.value.reduce((E, { message: U, index: T }) => E + n.displayText(T, U.message || "").length, 0));
  return We(() => [l.value.length, Z.value, n.loading], () => os(() => {
    o.value && (o.value.scrollTop = o.value.scrollHeight);
  })), We(() => n.newChatArmed, () => os(() => x())), We(() => n.active, (E) => {
    E && M();
  }), oi(() => {
    n.active && M(), window.addEventListener("keydown", C), i.value && typeof ResizeObserver < "u" && (G = new ResizeObserver(() => x()), G.observe(i.value)), x();
  }), ii(() => {
    window.removeEventListener("keydown", C), G == null || G.disconnect(), G = null;
  }), (E, U) => (v(), b("div", ag, [m("div", lg, [U[6] || (U[6] = m("svg", { class: "askai__bar-icon", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [m("path", { d: "M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 17l-1.9-5.3L5 9.8l5.1-1.9L12 3z" })], -1)), m("input", { ref_key: "inputEl", ref: r, type: "text", class: "askai__input", value: E.draft, placeholder: E.placeholder, disabled: !(E.typingEnabled ?? E.inputEnabled), "aria-label": E.placeholder, autocomplete: "off", spellcheck: "false", onInput: d, onKeydown: To(Es(_, ["prevent"]), ["enter"]) }, null, 40, cg), E.canStartNewChat ? (v(), b("button", { key: 0, type: "button", class: _e(["askai__new", { "askai__new--armed": E.newChatArmed }]), disabled: E.startingNewChat, title: S(Ko), "aria-label": S(Ko), "aria-expanded": E.newChatArmed, onClick: U[0] || (U[0] = (T) => s("newChat")) }, U[4] || (U[4] = [m("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [m("path", { d: "M12 20h9" }), m("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })], -1)]), 10, ug)) : Y("", !0), m("button", { type: "button", class: "askai__close", "aria-label": "Close", title: "Close (Esc)", onClick: U[1] || (U[1] = (T) => s("close")) }, U[5] || (U[5] = [m("span", { class: "askai__kbd" }, "Esc", -1)]))]), E.newChatArmed && E.canStartNewChat ? (v(), In(dp, { key: 0, busy: E.startingNewChat, error: E.newChatError, onConfirm: U[2] || (U[2] = (T) => s("confirmNewChat")), onCancel: U[3] || (U[3] = (T) => s("cancelNewChat")) }, null, 8, ["busy", "error"])) : Y("", !0), m("div", { ref_key: "bodyEl", ref: o, class: "askai__body" }, [m("div", { ref_key: "contentEl", ref: i, class: "askai__content" }, [c.value ? (v(), b(ve, { key: 1 }, [(v(!0), b(ve, null, Ve(l.value, ({ message: T, index: J }) => (v(), b("div", { key: J, class: "askai__turn", "aria-live": E.isStreaming(J) ? "off" : "polite" }, [T.message_type === "user" ? (v(), b("p", vg, q(T.message), 1)) : T.message_type === "system" ? (v(), b("p", yg, q(T.message), 1)) : (v(), b(ve, { key: 2 }, [m("div", { class: _e(["askai__answer", { "askai__answer--streaming": E.isStreaming(J) }]), innerHTML: S(Co)(E.isStreaming(J) ? E.displayText(J, T.message || "") : T.message || "") }, null, 10, bg), E.showCitations && !E.isStreaming(J) && T.sources && T.sources.length ? (v(), b("div", _g, [U[9] || (U[9] = m("span", { class: "askai__label" }, "Sources", -1)), (v(!0), b(ve, null, Ve(T.sources, (se, ie) => (v(), b("span", { key: ie, class: "askai__source", title: E.citationTooltip(se) }, q(E.citationLabel(se)), 9, wg))), 128))])) : Y("", !0)], 64))], 8, gg))), 128)), E.loading ? (v(), b("div", kg, [U[10] || (U[10] = m("span", { class: "askai__dot" }, null, -1)), U[11] || (U[11] = m("span", { class: "askai__dot" }, null, -1)), U[12] || (U[12] = m("span", { class: "askai__dot" }, null, -1)), m("span", xg, q(E.showCitations ? "Searching the knowledge base" : "Thinking"), 1)])) : Y("", !0)], 64)) : (v(), b(ve, { key: 0 }, [m("div", pg, [m("h2", dg, q(E.welcomeTitle || `Ask ${E.agentName}`), 1), E.welcomeSubtitle ? (v(), b("p", hg, q(E.welcomeSubtitle), 1)) : Y("", !0)]), E.suggestions.length && !E.draft.trim() ? (v(), b("div", fg, [U[8] || (U[8] = m("p", { class: "askai__label" }, "Suggested", -1)), (v(!0), b(ve, null, Ve(E.suggestions, (T) => (v(), b("button", { key: T, type: "button", class: "askai__suggestion", disabled: !E.inputEnabled, onClick: (J) => w(T) }, [m("span", null, q(T), 1), U[7] || (U[7] = m("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [m("path", { d: "M5 12h14M13 6l6 6-6 6" })], -1))], 8, mg))), 128))])) : Y("", !0)], 64))], 512)], 512), E.disclaimer || E.showBranding ? (v(), b("div", Sg, [E.disclaimer ? (v(), b("span", Tg, q(E.disclaimer), 1)) : Y("", !0), E.showBranding ? (v(), b("a", Ag, "Powered by ChatterMate")) : Y("", !0)])) : Y("", !0)]));
} }), Eg = Un(Cg, [["__scopeId", "data-v-68aaa0d9"]]), Rg = "#12150E", Og = "#C9F24E", Ig = "#FF9D87", Lg = "#F5F6F0", Ng = { ink: Rg, lime: Og, coral: Ig, paper: Lg }, Eo = Object.freeze(Ng), Dg = ["width", "height"], $g = ["fill"], Pg = ["cx", "r", "fill"], Fg = ["cx", "r", "fill"], Bg = 24, zg = zn({ __name: "BrandMark", props: { size: { default: 32 } }, setup(e) {
  const t = e, n = ne(() => t.size <= Bg ? { left: 22, right: 42, r: 10 } : { left: 23, right: 41, r: 8 });
  return (s, r) => (v(), b("svg", { class: "brand-mark", width: s.size, height: s.size, viewBox: "0 0 64 64", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", focusable: "false" }, [m("rect", { class: "brand-mark__tile", x: "0.75", y: "0.75", width: "62.5", height: "62.5", rx: "15.25", fill: S(Eo).ink }, null, 8, $g), m("circle", { cx: n.value.left, cy: "32", r: n.value.r, fill: S(Eo).lime }, null, 8, Pg), m("circle", { cx: n.value.right, cy: "32", r: n.value.r, fill: S(Eo).coral }, null, 8, Fg)], 8, Dg));
} }), xr = Un(zg, [["__scopeId", "data-v-982a6f45"]]), Mg = 40;
function Go(e) {
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e != "string") return null;
  const t = e.trim();
  return t && t.length <= Mg && !t.includes(`
`) ? t : null;
}
function Ug(e) {
  var s, r;
  const t = Go((s = e.preview) == null ? void 0 : s.before), n = Go((r = e.preview) == null ? void 0 : r.after);
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
  const r = Go(t), o = Go(n);
  return { approve: o ? `Change to ${o}` : "Change it", decline: r ? `Keep ${r}` : "Keep current" };
}
const qg = ["aria-label"], Hg = { class: "cm-action-head" }, Vg = { class: "cm-action-row before" }, Wg = { class: "cm-action-text" }, Kg = { class: "cm-action-row after" }, Gg = { class: "cm-action-text" }, Yg = { key: 1, class: "cm-action-args" }, Zg = { class: "cm-action-buttons" }, Jg = zn({ __name: "ActionConfirmCard", props: { pending: {} }, emits: ["approve", "decline"], setup(e, { emit: t }) {
  const n = e, s = t, r = ne(() => !!n.pending.preview);
  function o(c) {
    return c == null || c === "" ? "—" : typeof c == "string" ? c : JSON.stringify(c, null, 2);
  }
  function i(c) {
    const d = c.replace(/[_-]+/g, " ").trim();
    return d.charAt(0).toUpperCase() + d.slice(1);
  }
  const a = ne(() => n.pending.details ?? Object.entries(n.pending.request.args || {}).map(([c, d]) => ({ key: i(c), value: o(d) }))), l = ne(() => {
    var c, d;
    return jg(n.pending.request.label, (c = n.pending.preview) == null ? void 0 : c.before, (d = n.pending.preview) == null ? void 0 : d.after, r.value);
  });
  return (c, d) => {
    var _, w;
    return v(), b("div", { class: "cm-action-confirm", role: "group", "aria-label": c.pending.request.label }, [m("div", Hg, q(c.pending.request.label) + "?", 1), r.value ? (v(), b(ve, { key: 0 }, [m("div", Vg, [d[2] || (d[2] = m("span", { class: "cm-action-tag" }, "Current", -1)), m("span", Wg, q(o((_ = c.pending.preview) == null ? void 0 : _.before)), 1)]), m("div", Kg, [d[3] || (d[3] = m("span", { class: "cm-action-tag" }, "New", -1)), m("span", Gg, q(o((w = c.pending.preview) == null ? void 0 : w.after)), 1)])], 64)) : a.value.length ? (v(), b("dl", Yg, [(v(!0), b(ve, null, Ve(a.value, (k) => (v(), b(ve, { key: k.key }, [m("dt", null, q(k.key), 1), m("dd", null, q(k.value), 1)], 64))), 128))])) : Y("", !0), m("div", Zg, [m("button", { type: "button", class: "cm-action-apply", onClick: d[0] || (d[0] = (k) => s("approve")) }, q(l.value.approve), 1), m("button", { type: "button", class: "cm-action-cancel", onClick: d[1] || (d[1] = (k) => s("decline")) }, q(l.value.decline), 1)])], 8, qg);
  };
} }), Qg = Un(Jg, [["__scopeId", "data-v-bdc9ad66"]]), Xg = { key: 0, class: "cm-receipt-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, ev = { key: 1, class: "cm-receipt-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, tv = { key: 2, class: "cm-receipt-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, nv = { class: "cm-visually-hidden" }, sv = { class: "cm-receipt-text" }, rv = zn({ __name: "ActionReceiptLine", props: { receipt: {} }, setup(e) {
  return (t, n) => (v(), b("div", { class: _e(["cm-receipt", t.receipt.tone]), role: "status" }, [t.receipt.tone === "done" ? (v(), b("svg", Xg, n[0] || (n[0] = [m("circle", { cx: "12", cy: "12", r: "10", class: "fill" }, null, -1), m("path", { d: "M7.5 12.5l3 3 6-6.5", class: "tick" }, null, -1)]))) : t.receipt.tone === "failed" ? (v(), b("svg", ev, n[1] || (n[1] = [m("circle", { cx: "12", cy: "12", r: "9", class: "ring" }, null, -1), m("path", { d: "M12 7.5v5.5M12 16.5v.01", class: "mark" }, null, -1)]))) : (v(), b("svg", tv, n[2] || (n[2] = [m("circle", { cx: "12", cy: "12", r: "9", class: "ring" }, null, -1), m("path", { d: "M8 12h8", class: "mark" }, null, -1)]))), m("span", nv, q(t.receipt.tone === "done" ? "Done:" : t.receipt.tone === "failed" ? "Failed:" : "Skipped:"), 1), m("span", sv, q(t.receipt.text), 1)], 2));
} }), ov = Un(rv, [["__scopeId", "data-v-be379090"]]), iv = { class: "cm-plan-pin" }, av = ["aria-label"], lv = ["aria-expanded"], cv = { class: "cm-plan-label" }, uv = { class: "cm-plan-name" }, pv = { key: 0, class: "cm-plan-now" }, dv = { class: "cm-plan-count" }, hv = ["aria-valuenow", "aria-valuemax", "aria-label"], fv = { key: 0, class: "cm-plan-steps" }, mv = ["aria-current"], gv = { key: 0, class: "cm-plan-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, vv = { key: 1, class: "cm-plan-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, yv = { key: 2, class: "cm-plan-icon", "aria-hidden": "true", viewBox: "0 0 24 24" }, bv = { class: "cm-plan-title" }, _v = { key: 3, class: "cm-visually-hidden" }, wv = { class: "cm-plan-actions" }, kv = zn({ __name: "JourneyPlan", props: { progress: {} }, emits: ["skip", "hide"], setup(e, { emit: t }) {
  const n = e, s = t, r = te(!1);
  We(() => n.progress.finished, (l) => {
    l && (r.value = !1);
  });
  const o = ne(() => Math.min(n.progress.index, n.progress.count)), i = ne(() => n.progress.count ? Math.round(o.value / n.progress.count * 100) : 0), a = ne(() => n.progress.titles.map((l, c) => ({ title: l, state: c < o.value ? "done" : c === n.progress.index ? "now" : "todo" })));
  return (l, c) => (v(), b("div", iv, [m("section", { class: _e(["cm-plan", { finished: l.progress.finished }]), "aria-label": `Guide: ${l.progress.name}` }, [m("button", { type: "button", class: "cm-plan-head", "aria-expanded": r.value, onClick: c[0] || (c[0] = (d) => r.value = !r.value) }, [m("span", cv, [m("span", uv, q(l.progress.name), 1), !l.progress.finished && l.progress.title ? (v(), b("span", pv, q(l.progress.title), 1)) : Y("", !0)]), m("span", dv, q(l.progress.finished ? "Done" : `${o.value} of ${l.progress.count}`), 1), (v(), b("svg", { class: _e(["cm-plan-chevron", { open: r.value }]), "aria-hidden": "true", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" }, c[3] || (c[3] = [m("path", { d: "M6 9l6 6 6-6" }, null, -1)]), 2))], 8, lv), m("div", { class: "cm-plan-bar", role: "progressbar", "aria-valuenow": o.value, "aria-valuemin": "0", "aria-valuemax": l.progress.count, "aria-label": `${o.value} of ${l.progress.count} done` }, [m("span", { style: fe({ width: `${i.value}%` }) }, null, 4)], 8, hv), r.value ? (v(), b(ve, { key: 0 }, [a.value.length ? (v(), b("ol", fv, [(v(!0), b(ve, null, Ve(a.value, (d, _) => (v(), b("li", { key: _, class: _e(d.state), "aria-current": d.state === "now" ? "step" : void 0 }, [d.state === "done" ? (v(), b("svg", gv, c[4] || (c[4] = [m("circle", { cx: "12", cy: "12", r: "10", class: "fill" }, null, -1), m("path", { d: "M7.5 12.5l3 3 6-6.5", class: "tick" }, null, -1)]))) : d.state === "now" ? (v(), b("svg", vv, c[5] || (c[5] = [m("circle", { cx: "12", cy: "12", r: "9", class: "ring" }, null, -1), m("circle", { cx: "12", cy: "12", r: "4", class: "fill" }, null, -1)]))) : (v(), b("svg", yv, c[6] || (c[6] = [m("circle", { cx: "12", cy: "12", r: "9", class: "ring todo" }, null, -1)]))), m("span", bv, q(d.title), 1), d.state === "done" ? (v(), b("span", _v, "(done)")) : Y("", !0)], 10, mv))), 128))])) : Y("", !0), m("div", wv, [l.progress.skippable ? (v(), b("button", { key: 0, type: "button", onClick: c[1] || (c[1] = (d) => s("skip")) }, "Skip this step")) : Y("", !0), m("button", { type: "button", onClick: c[2] || (c[2] = (d) => s("hide")) }, "Hide guide")])], 64)) : Y("", !0)], 10, av)]));
} }), xv = Un(kv, [["__scopeId", "data-v-016d08e3"]]), Sv = { class: "cm-replies", role: "group", "aria-label": "Suggested replies" }, Tv = ["disabled", "onClick"], Av = zn({ __name: "SuggestedReplies", props: { chips: {}, disabled: { type: Boolean } }, emits: ["pick"], setup(e, { emit: t }) {
  const n = t;
  return (s, r) => (v(), b("div", Sv, [(v(!0), b(ve, null, Ve(s.chips, (o) => (v(), b("button", { key: o.label, type: "button", class: "cm-reply", disabled: s.disabled, onClick: (i) => n("pick", o) }, q(o.label), 9, Tv))), 128))]));
} }), Cv = Un(Av, [["__scopeId", "data-v-7b650713"]]), Ev = 2e4, hp = "Couldn't add this to your cart. Please try again.", Rv = { status: "idle", error: null }, ma = te(null), Ka = qr({}), ga = /* @__PURE__ */ new Map(), fp = /* @__PURE__ */ new Map();
let Ov = 0;
const Iv = (e, t) => e.toLowerCase() === t.toLowerCase();
function Lv(e, t) {
  return !!(e.cart_variant_id && t && ma.value && Iv(ma.value, t));
}
function mp(e) {
  return Ka[e] ?? Rv;
}
function gp(e, t, n) {
  (n.status === "added" || fp.get(e) === t) && (Ka[e] = n);
}
function Nv(e, t) {
  const n = ga.get(e);
  n && (clearTimeout(n.timer), ga.delete(e), gp(n.variantId, e, t));
}
function Dv(e) {
  if (mp(e).status === "adding") return;
  const t = `cart-${++Ov}`;
  Ka[e] = { status: "adding", error: null }, fp.set(e, t), ga.set(t, { variantId: e, timer: setTimeout(() => gp(e, t, { status: "failed", error: hp }), Ev) }), st({ type: "ADD_TO_CART", requestId: t, variantId: e });
}
function Rc() {
  st({ type: "VIEW_CART" });
}
function $v(e) {
  if (e.type === "CART_AVAILABLE") return ma.value = typeof e.shop == "string" && e.shop ? e.shop : null, !0;
  if (e.type === "ADD_TO_CART_DONE") {
    const t = typeof e.error == "string" && e.error ? e.error : hp;
    return Nv(String(e.requestId), e.ok === !0 ? { status: "added", error: null } : { status: "failed", error: t }), !0;
  }
  return !1;
}
const Pv = { class: "cm-cart" }, Fv = ["disabled"], Bv = { key: 2, class: "cm-cart-note", role: "status" }, zv = { key: 3, class: "cm-cart-note cm-cart-error", role: "alert" }, Mv = zn({ __name: "ProductCartButton", props: { variantId: {} }, setup(e) {
  const t = e, n = ne(() => mp(t.variantId));
  return (s, r) => (v(), b("div", Pv, [n.value.status === "added" ? (v(), b("button", { key: 0, type: "button", class: "cm-cart-button", onClick: r[0] || (r[0] = (...o) => S(Rc) && S(Rc)(...o)) }, " View cart ")) : (v(), b("button", { key: 1, type: "button", class: "cm-cart-button", disabled: n.value.status === "adding", onClick: r[1] || (r[1] = (o) => S(Dv)(s.variantId)) }, q(n.value.status === "adding" ? "Adding…" : "Add to cart"), 9, Fv)), n.value.status === "added" ? (v(), b("p", Bv, "Added to your cart")) : n.value.error ? (v(), b("p", zv, q(n.value.error), 1)) : Y("", !0)]));
} }), Uv = Un(Mv, [["__scopeId", "data-v-375a4eee"]]);
function jv(e) {
  const t = te([]);
  function n(r) {
    t.value.push({ after: e.value.length, receipt: Ug(r) });
  }
  function s(r) {
    return t.value.filter((o) => o.after === r).map((o) => o.receipt);
  }
  return We(() => e.value.length, (r) => {
    r === 0 ? t.value = [] : t.value.some((o) => o.after > r) && (t.value = t.value.filter((o) => o.after <= r));
  }), { receipts: t, addReceipt: n, receiptsAfter: s };
}
const qv = "Please don't paste passwords or keys here.", Hv = [/\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/, /\bcmat_[A-Za-z0-9_-]{16,}/, /\bAKIA[0-9A-Z]{16}\b/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\bxox[abposr]-[A-Za-z0-9-]{10,}/], Vv = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i, Wv = /\b(?:\d[ -]?){12,18}\d\b/g;
function Kv(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    let s = Number(e[e.length - 1 - n]);
    n % 2 === 1 && (s *= 2, s > 9 && (s -= 9)), t += s;
  }
  return t % 10 === 0;
}
function Gv(e) {
  return e ? Hv.some((t) => t.test(e)) || Vv.test(e) ? !0 : (e.match(Wv) || []).some((t) => {
    const n = t.replace(/\D/g, "");
    return n.length >= 13 && n.length <= 19 && Kv(n);
  }) : !1;
}
const Cr = [{ stops: "#9D8CFF, #5FE3D6, #C9F24E", glow: "rgba(157,140,255,0.45)" }, { stops: "#FF8A73, #9D8CFF, #5FE3D6", glow: "rgba(255,138,115,0.40)" }, { stops: "#5FE3D6, #C9F24E, #9D8CFF", glow: "rgba(95,227,214,0.40)" }, { stops: "#C9F24E, #5FE3D6, #FF8A73", glow: "rgba(201,242,78,0.35)" }, { stops: "#6EA8FF, #9D8CFF, #5FE3D6", glow: "rgba(110,168,255,0.42)" }, { stops: "#FF7AC6, #9D8CFF, #6EA8FF", glow: "rgba(255,122,198,0.42)" }, { stops: "#FF8A73, #FFC857, #FF7AC6", glow: "rgba(255,200,87,0.40)" }, { stops: "#7C5CFF, #B388FF, #5FE3D6", glow: "rgba(124,92,255,0.45)" }, { stops: "#0EA5A5, #5FE3D6, #C9F24E", glow: "rgba(14,165,165,0.40)" }, { stops: "#F34611, #FF8A73, #FFC857", glow: "rgba(243,70,17,0.38)" }], Yv = (e) => (e || "").split("").reduce((t, n) => t + n.charCodeAt(0), 0) % Cr.length, Zv = (e) => {
  const t = Cr[(e % Cr.length + Cr.length) % Cr.length];
  return { background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${t.stops})
        `.trim(), boxShadow: `0 4px 28px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`, borderRadius: "50%" };
}, Jv = (e, t) => {
  const n = typeof t == "number" && Number.isFinite(t) ? t : Yv(e);
  return Zv(n);
}, Oc = (e) => {
  var t;
  return !!((t = e == null ? void 0 : e.attributes) != null && t.end_chat);
}, Ic = "AI can make mistakes. Check important info.";
function Qv(e, t = !1) {
  return e !== !1 && !t;
}
const qi = { ai: "Online · replies instantly", human: "Online · usually replies in a few minutes", away: "Away · we'll reply when we're back" };
function Xv(e, t = !1) {
  return (t ? "human" : (e == null ? void 0 : e.mode) ?? "ai") === "ai" ? { text: qi.ai, online: !0 } : (e == null ? void 0 : e.available) !== !1 ? { text: qi.human, online: !0 } : { text: qi.away, online: !1 };
}
const vp = (e) => !!e && (/^https?:\/\//i.test(e) || e.startsWith("data:")), ey = (e, t) => e ? vp(e) || e.startsWith("blob:") ? e : `${t.replace(/\/api\/v1\/?$/, "")}${e.startsWith("/") ? "" : "/"}${e}` : "";
function Lc() {
  return typeof window < "u" && window.APP_CONFIG ? window.APP_CONFIG : {};
}
const Ds = { get API_URL() {
  return Lc().API_URL || void 0 || "https://api.chattermate.chat/api/v1";
}, get WS_URL() {
  return Lc().WS_URL || void 0 || "wss://api.chattermate.chat";
} };
function Yo(e) {
  return ey(e, Ds.API_URL);
}
const yp = "ctid", ty = "identity_expired", ny = "invalid_token", Nc = 0.8, sy = 720 * 60 * 1e3, Hi = 30 * 1e3, Vi = 1e3, as = (e) => {
  if (typeof e != "string") return e ? String(e) : null;
  const t = e.trim();
  return !t || t === "undefined" || t === "null" ? null : t;
}, Ro = (e) => {
  const t = as(e);
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
}, Zo = (e = yp) => ({ read: () => {
  try {
    return as(localStorage.getItem(e));
  } catch {
    return null;
  }
}, write: (t) => {
  try {
    localStorage.setItem(e, t);
  } catch {
  }
}, clear: () => {
  try {
    localStorage.removeItem(e);
  } catch {
  }
} }), oy = () => ({ read: () => null, write: () => {
}, clear: () => {
} });
function iy(e = {}) {
  const t = e.store ?? Zo(), n = te(null);
  let s = null, r = null;
  const o = () => {
    s && (clearTimeout(s), s = null);
  }, i = () => {
    const k = Ro(n.value);
    return k != null && k.exp ? Number(k.exp) - Math.floor(Date.now() / Vi) : null;
  }, a = () => {
    const k = Ro(n.value);
    if (!(k != null && k.exp)) return !1;
    const C = k.iat ? Number(k.exp) - Number(k.iat) : 0, M = i() ?? 0;
    return C <= 0 ? M <= 0 : M <= C * (1 - Nc);
  }, l = (k, { persist: C = !0 } = {}) => {
    var x, G;
    const M = as(k), K = !!n.value;
    if (o(), n.value = M, !M) {
      t.clear(), K && ((x = e.onTokenCleared) == null || x.call(e));
      return;
    }
    C && (t.write(M), (G = e.onTokenChanged) == null || G.call(e, M)), _();
  }, c = async (k) => {
    if (!n.value || !k) return !1;
    if (r) return r;
    const C = n.value;
    return r = (async () => {
      var M, K;
      try {
        const x = await fetch(`${Ds.API_URL}/refresh-token`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${C}` }, body: JSON.stringify({ widget_id: k }) });
        if (x.status === 401) return await ry(x) !== ny && ((M = e.onIdentityExpired) == null || M.call(e)), !1;
        if (!x.ok) return _(Hi), !1;
        const G = await x.json(), Z = as((K = G == null ? void 0 : G.data) == null ? void 0 : K.token);
        return Z ? (l(Z), !0) : !1;
      } catch {
        return _(Hi), !1;
      } finally {
        r = null;
      }
    })(), r;
  }, d = async (k) => n.value ? a() ? c(k) : !0 : !1, _ = (k) => {
    o();
    const C = Ro(n.value);
    if (!(C != null && C.exp) || !(C != null && C.iat)) return;
    const M = (Number(C.exp) - Number(C.iat)) * Vi, K = (i() ?? 0) * Vi, x = k ?? Math.min(sy, Math.max(0, K - M * (1 - Nc)));
    s = setTimeout(() => {
      s = null, d(w).then((G) => {
        _(G ? void 0 : Hi);
      });
    }, x);
  };
  let w = "";
  return { token: n, start: (k, C) => {
    w = k;
    const M = as(C) || t.read();
    l(M, { persist: !1 }), M && t.write(M);
  }, stop: () => {
    o(), r = null;
  }, setToken: l, ensureFresh: d };
}
const or = window.__CM_FRAME__, bp = "null";
let Ls = !1, _p = !1, wp = null;
const Jo = () => !!or, Is = () => !or || Ls && !_p, kp = () => wp, xp = (e) => {
  typeof e == "string" && e && (wp = e);
}, Sp = (e) => or ? Ls ? oy() : Zo(`${yp}:${e}`) : Zo(), ay = () => new Promise((e) => {
  const t = (n) => {
    var r;
    if (n.source !== window.parent || ((r = n.data) == null ? void 0 : r.type) !== "HOST_INIT") return;
    window.removeEventListener("message", t);
    const s = n.origin === bp;
    e({ origin: n.origin, token: s ? null : as(n.data.token), pageUrl: typeof n.data.pageUrl == "string" ? n.data.pageUrl : null });
  };
  window.addEventListener("message", t), window.parent.postMessage({ type: "FRAME_READY" }, "*");
}), ly = async (e) => {
  var t, n;
  try {
    return ((n = (t = await e.json()) == null ? void 0 : t.detail) == null ? void 0 : n.code) || "unavailable";
  } catch {
    return "unavailable";
  }
}, Dc = () => {
  const e = document.getElementById("app");
  e && (e.textContent = "Chat is unavailable right now.");
};
async function cy() {
  if (!or) return !0;
  const e = new URL(window.location.href).searchParams;
  Ls = e.get("host") === "1" && window.parent !== window;
  let t, n = null;
  if (Ls) {
    const i = await ay();
    i.origin !== bp ? (Ac(i.origin), n = i.origin) : (_p = !0, Ac("*")), xp(i.pageUrl), t = i.token;
  } else t = Sp(or.widgetId).read();
  let s;
  try {
    s = await fetch(`${Ds.API_URL}/widgets/${encodeURIComponent(or.widgetId)}/bootstrap`, { method: "POST", headers: { "Content-Type": "application/json", ...t ? { Authorization: `Bearer ${t}` } : {} }, body: JSON.stringify({ host_origin: n, source: e.get("source") }) });
  } catch {
    return Ls ? st({ type: "WIDGET_ERROR", code: "unavailable" }) : Dc(), !1;
  }
  if (!s.ok) {
    const i = await ly(s);
    return Ls ? st({ type: "WIDGET_ERROR", code: i }) : Dc(), !1;
  }
  const r = await s.json();
  window.__INITIAL_DATA__ = r;
  const o = as(r.initialToken);
  return Is() && o && o !== t && st({ type: "TOKEN_UPDATE", token: o }), !0;
}
const uy = () => {
  Ls && st({ type: "WIDGET_READY" });
}, va = Eo.ink;
function py(e) {
  const t = ne(() => ({ backgroundColor: "var(--cm-card)", color: "var(--cm-text)" })), n = ne(() => ({ backgroundColor: e.value.chat_bubble_color || va, color: sr(e.value.chat_bubble_color || va) ? "#FFFFFF" : "#000000" })), s = ne(() => ({ backgroundColor: "var(--cm-agent-bg)", color: "var(--cm-text)" })), r = ne(() => ({ backgroundColor: "var(--cm-accent)", color: "var(--cm-on-accent)" })), o = ne(() => ({ color: "var(--cm-text)" })), i = ne(() => ({ borderBottom: "1px solid var(--cm-hairline)" })), a = ne(() => Yo(e.value.photo_url)), l = ne(() => {
    const c = e.value.chat_background_color || "#ffffff";
    return { boxShadow: `0 8px 5px ${sr(c) ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.12)"}` };
  });
  return { chatStyles: t, chatIconStyles: n, agentBubbleStyles: s, userBubbleStyles: r, messageNameStyles: o, headerBorderStyles: i, photoUrl: a, shadowStyle: l };
}
const dy = /* @__PURE__ */ new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]), hy = /* @__PURE__ */ new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);
[...dy, ...hy];
function fy(e, t) {
  const n = te([]), s = te(!1), r = te(null), o = (K) => {
    if (K === 0) return "0 Bytes";
    const x = 1024, G = ["Bytes", "KB", "MB", "GB"], Z = Math.floor(Math.log(K) / Math.log(x));
    return parseFloat((K / Math.pow(x, Z)).toFixed(2)) + " " + G[Z];
  }, i = (K) => K.startsWith("image/"), a = (K) => K ? Yo(K) : "", l = (K) => {
    const x = K.file_url || K.url;
    return x ? Yo(x) : "";
  }, c = async (K) => {
    const x = K.target;
    x.files && x.files.length > 0 && (await M(Array.from(x.files)), x.value = "");
  }, d = async (K) => {
    var G;
    K.preventDefault();
    const x = (G = K.dataTransfer) == null ? void 0 : G.files;
    x && x.length > 0 && await M(Array.from(x));
  }, _ = (K) => {
    K.preventDefault();
  }, w = (K) => {
    K.preventDefault();
  }, k = async (K) => {
    var Z;
    const x = (Z = K.clipboardData) == null ? void 0 : Z.items;
    if (!x) return;
    const G = [];
    for (const E of Array.from(x)) if (E.kind === "file") {
      const U = E.getAsFile();
      U && G.push(U);
    }
    G.length > 0 && await M(G);
  }, C = async (K, x = 500) => new Promise((G, Z) => {
    const E = new FileReader();
    E.onload = (U) => {
      var J;
      const T = new Image();
      T.onload = () => {
        const se = document.createElement("canvas");
        let ie = T.width, ce = T.height;
        const Ce = 1920;
        (ie > Ce || ce > Ce) && (ie > ce ? (ce = ce / ie * Ce, ie = Ce) : (ie = ie / ce * Ce, ce = Ce)), se.width = ie, se.height = ce;
        const Ke = se.getContext("2d");
        if (!Ke) {
          Z(new Error("Failed to get canvas context"));
          return;
        }
        Ke.drawImage(T, 0, 0, ie, ce);
        let ot = 0.9;
        const Xe = () => {
          se.toBlob((Ne) => {
            if (!Ne) {
              Z(new Error("Failed to compress image"));
              return;
            }
            if (Ne.size / 1024 > x && ot > 0.3) ot -= 0.1, Xe();
            else {
              const ge = new FileReader();
              ge.onload = () => {
                const ye = ge.result.split(",")[1];
                G({ blob: Ne, base64: ye });
              }, ge.readAsDataURL(Ne);
            }
          }, K.type === "image/png" ? "image/png" : "image/jpeg", ot);
        };
        Xe();
      }, T.onerror = () => Z(new Error("Failed to load image")), T.src = (J = U.target) == null ? void 0 : J.result;
    }, E.onerror = () => Z(new Error("Failed to read file")), E.readAsDataURL(K);
  }), M = async (K) => {
    if (n.value.length >= 3) {
      alert("Maximum 3 files allowed per message");
      return;
    }
    const x = 3 - n.value.length, G = K.slice(0, x);
    K.length > x && alert(`Only ${x} more file(s) can be uploaded. Maximum 3 files per message.`);
    for (const Z of G) try {
      if (n.value.some((T) => T.filename === Z.name)) {
        console.warn(`File ${Z.name} is already selected`), alert(`File "${Z.name}" is already selected`);
        continue;
      }
      const E = Z.type.startsWith("image/"), U = E ? 5242880 : 10485760;
      if (Z.size > U) {
        const T = U / 1048576;
        console.error(`File ${Z.name} is too large. Maximum size is ${T}MB`), alert(`File "${Z.name}" is too large. Maximum size for ${E ? "images" : "documents"} is ${T}MB`);
        continue;
      }
      if (E) try {
        const { blob: T, base64: J } = await C(Z, 500), se = T.size;
        console.log(`Compressed ${Z.name}: ${(Z.size / 1024).toFixed(2)}KB → ${(se / 1024).toFixed(2)}KB`), n.value.push({ content: J, filename: Z.name, type: Z.type, size: se, url: URL.createObjectURL(T), file_url: URL.createObjectURL(T) });
      } catch (T) {
        console.error("Image compression failed, uploading original:", T);
        const J = new FileReader();
        J.onload = (se) => {
          var ce;
          const ie = ((ce = se.target) == null ? void 0 : ce.result).split(",")[1];
          n.value.push({ content: ie, filename: Z.name, type: Z.type, size: Z.size, url: URL.createObjectURL(Z), file_url: URL.createObjectURL(Z) });
        }, J.readAsDataURL(Z);
      }
      else {
        const T = new FileReader();
        T.onload = (J) => {
          var ie;
          const se = ((ie = J.target) == null ? void 0 : ie.result).split(",")[1];
          n.value.push({ content: se, filename: Z.name, type: Z.type || "application/octet-stream", size: Z.size, url: "", file_url: "" });
        }, T.readAsDataURL(Z);
      }
    } catch (E) {
      console.error("File upload error:", E);
    }
  };
  return { uploadedAttachments: n, previewModal: s, previewFile: r, formatFileSize: o, isImageAttachment: i, getDownloadUrl: a, getPreviewUrl: l, handleFileSelect: c, handleDrop: d, handleDragOver: _, handleDragLeave: w, handlePaste: k, uploadFiles: M, removeAttachment: async (K) => {
    const x = n.value[K];
    if (x) {
      try {
        let G = x.url;
        if (G.startsWith("/uploads/") ? G = G.substring(9) : G.startsWith("/") && (G = G.substring(1)), vp(G)) try {
          G = new URL(G).pathname.replace(/^\/+/, "");
        } catch {
        }
        const Z = {};
        e.value && (Z.Authorization = `Bearer ${e.value}`);
        const E = await fetch(`${Ds.API_URL}/files/upload/${G}`, { method: "DELETE", headers: Z });
        if (E.ok) console.log("File deleted successfully from backend.");
        else {
          const U = await E.json();
          console.error("Failed to delete file:", U.detail);
        }
      } catch (G) {
        console.error("Error calling delete API:", G);
      }
      x.url && x.url.startsWith("blob:") && URL.revokeObjectURL(x.url), x.file_url && x.file_url.startsWith("blob:") && URL.revokeObjectURL(x.file_url), n.value.splice(K, 1);
    }
  }, openPreview: (K) => {
    r.value = K, s.value = !0;
  }, closePreview: () => {
    s.value = !1, setTimeout(() => {
      r.value = null;
    }, 300);
  }, openFilePicker: () => {
    var K;
    (K = t.value) == null || K.click();
  }, isImage: (K) => K.startsWith("image/") };
}
const vn = /* @__PURE__ */ Object.create(null);
vn.open = "0", vn.close = "1", vn.ping = "2", vn.pong = "3", vn.message = "4", vn.upgrade = "5", vn.noop = "6";
const Oo = /* @__PURE__ */ Object.create(null);
Object.keys(vn).forEach((e) => {
  Oo[vn[e]] = e;
});
const ya = { type: "error", data: "parser error" }, Tp = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Ap = typeof ArrayBuffer == "function", Cp = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, Ga = ({ type: e, data: t }, n, s) => Tp && t instanceof Blob ? n ? s(t) : $c(t, s) : Ap && (t instanceof ArrayBuffer || Cp(t)) ? n ? s(t) : $c(new Blob([t]), s) : s(vn[e] + (t || "")), $c = (e, t) => {
  const n = new FileReader();
  return n.onload = function() {
    const s = n.result.split(",")[1];
    t("b" + (s || ""));
  }, n.readAsDataURL(e);
};
function Pc(e) {
  return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
let Wi;
function my(e, t) {
  if (Tp && e.data instanceof Blob) return e.data.arrayBuffer().then(Pc).then(t);
  if (Ap && (e.data instanceof ArrayBuffer || Cp(e.data))) return t(Pc(e.data));
  Ga(e, !1, (n) => {
    Wi || (Wi = new TextEncoder()), t(Wi.encode(n));
  });
}
const Fc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Er = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < Fc.length; e++) Er[Fc.charCodeAt(e)] = e;
const gy = (e) => {
  let t = e.length * 0.75, n = e.length, s, r = 0, o, i, a, l;
  e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
  const c = new ArrayBuffer(t), d = new Uint8Array(c);
  for (s = 0; s < n; s += 4) o = Er[e.charCodeAt(s)], i = Er[e.charCodeAt(s + 1)], a = Er[e.charCodeAt(s + 2)], l = Er[e.charCodeAt(s + 3)], d[r++] = o << 2 | i >> 4, d[r++] = (i & 15) << 4 | a >> 2, d[r++] = (a & 3) << 6 | l & 63;
  return c;
}, vy = typeof ArrayBuffer == "function", Ya = (e, t) => {
  if (typeof e != "string") return { type: "message", data: Ep(e, t) };
  const n = e.charAt(0);
  return n === "b" ? { type: "message", data: yy(e.substring(1), t) } : Oo[n] ? e.length > 1 ? { type: Oo[n], data: e.substring(1) } : { type: Oo[n] } : ya;
}, yy = (e, t) => {
  if (vy) {
    const n = gy(e);
    return Ep(n, t);
  } else return { base64: !0, data: e };
}, Ep = (e, t) => {
  switch (t) {
    case "blob":
      return e instanceof Blob ? e : new Blob([e]);
    case "arraybuffer":
    default:
      return e instanceof ArrayBuffer ? e : e.buffer;
  }
}, Rp = "", by = (e, t) => {
  const n = e.length, s = new Array(n);
  let r = 0;
  e.forEach((o, i) => {
    Ga(o, !1, (a) => {
      s[i] = a, ++r === n && t(s.join(Rp));
    });
  });
}, _y = (e, t) => {
  const n = e.split(Rp), s = [];
  for (let r = 0; r < n.length; r++) {
    const o = Ya(n[r], t);
    if (s.push(o), o.type === "error") break;
  }
  return s;
};
function wy() {
  return new TransformStream({ transform(e, t) {
    my(e, (n) => {
      const s = n.length;
      let r;
      if (s < 126) r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
      else if (s < 65536) {
        r = new Uint8Array(3);
        const o = new DataView(r.buffer);
        o.setUint8(0, 126), o.setUint16(1, s);
      } else {
        r = new Uint8Array(9);
        const o = new DataView(r.buffer);
        o.setUint8(0, 127), o.setBigUint64(1, BigInt(s));
      }
      e.data && typeof e.data != "string" && (r[0] |= 128), t.enqueue(r), t.enqueue(n);
    });
  } });
}
let Ki;
function vo(e) {
  return e.reduce((t, n) => t + n.length, 0);
}
function yo(e, t) {
  if (e[0].length === t) return e.shift();
  const n = new Uint8Array(t);
  let s = 0;
  for (let r = 0; r < t; r++) n[r] = e[0][s++], s === e[0].length && (e.shift(), s = 0);
  return e.length && s < e[0].length && (e[0] = e[0].slice(s)), n;
}
function ky(e, t) {
  Ki || (Ki = new TextDecoder());
  const n = [];
  let s = 0, r = -1, o = !1;
  return new TransformStream({ transform(i, a) {
    for (n.push(i); ; ) {
      if (s === 0) {
        if (vo(n) < 1) break;
        const l = yo(n, 1);
        o = (l[0] & 128) === 128, r = l[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2;
      } else if (s === 1) {
        if (vo(n) < 2) break;
        const l = yo(n, 2);
        r = new DataView(l.buffer, l.byteOffset, l.length).getUint16(0), s = 3;
      } else if (s === 2) {
        if (vo(n) < 8) break;
        const l = yo(n, 8), c = new DataView(l.buffer, l.byteOffset, l.length), d = c.getUint32(0);
        if (d > Math.pow(2, 21) - 1) {
          a.enqueue(ya);
          break;
        }
        r = d * Math.pow(2, 32) + c.getUint32(4), s = 3;
      } else {
        if (vo(n) < r) break;
        const l = yo(n, r);
        a.enqueue(Ya(o ? l : Ki.decode(l), t)), s = 0;
      }
      if (r === 0 || r > e) {
        a.enqueue(ya);
        break;
      }
    }
  } });
}
const Op = 4;
function Ze(e) {
  if (e) return xy(e);
}
function xy(e) {
  for (var t in Ze.prototype) e[t] = Ze.prototype[t];
  return e;
}
Ze.prototype.on = Ze.prototype.addEventListener = function(e, t) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
}, Ze.prototype.once = function(e, t) {
  function n() {
    this.off(e, n), t.apply(this, arguments);
  }
  return n.fn = t, this.on(e, n), this;
}, Ze.prototype.off = Ze.prototype.removeListener = Ze.prototype.removeAllListeners = Ze.prototype.removeEventListener = function(e, t) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
  var n = this._callbacks["$" + e];
  if (!n) return this;
  if (arguments.length == 1) return delete this._callbacks["$" + e], this;
  for (var s, r = 0; r < n.length; r++) if (s = n[r], s === t || s.fn === t) {
    n.splice(r, 1);
    break;
  }
  return n.length === 0 && delete this._callbacks["$" + e], this;
}, Ze.prototype.emit = function(e) {
  this._callbacks = this._callbacks || {};
  for (var t = new Array(arguments.length - 1), n = this._callbacks["$" + e], s = 1; s < arguments.length; s++) t[s - 1] = arguments[s];
  if (n) {
    n = n.slice(0);
    for (var s = 0, r = n.length; s < r; ++s) n[s].apply(this, t);
  }
  return this;
}, Ze.prototype.emitReserved = Ze.prototype.emit, Ze.prototype.listeners = function(e) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
}, Ze.prototype.hasListeners = function(e) {
  return !!this.listeners(e).length;
};
const di = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), Zt = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Sy = "arraybuffer";
function Ip(e, ...t) {
  return t.reduce((n, s) => (e.hasOwnProperty(s) && (n[s] = e[s]), n), {});
}
const Ty = Zt.setTimeout, Ay = Zt.clearTimeout;
function hi(e, t) {
  t.useNativeTimers ? (e.setTimeoutFn = Ty.bind(Zt), e.clearTimeoutFn = Ay.bind(Zt)) : (e.setTimeoutFn = Zt.setTimeout.bind(Zt), e.clearTimeoutFn = Zt.clearTimeout.bind(Zt));
}
const Cy = 1.33;
function Ey(e) {
  return typeof e == "string" ? Ry(e) : Math.ceil((e.byteLength || e.size) * Cy);
}
function Ry(e) {
  let t = 0, n = 0;
  for (let s = 0, r = e.length; s < r; s++) t = e.charCodeAt(s), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (s++, n += 4);
  return n;
}
function Lp() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Oy(e) {
  let t = "";
  for (let n in e) e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
  return t;
}
function Iy(e) {
  let t = {}, n = e.split("&");
  for (let s = 0, r = n.length; s < r; s++) {
    let o = n[s].split("=");
    t[decodeURIComponent(o[0])] = decodeURIComponent(o[1]);
  }
  return t;
}
class Ly extends Error {
  constructor(t, n, s) {
    super(t), this.description = n, this.context = s, this.type = "TransportError";
  }
}
class Za extends Ze {
  constructor(t) {
    super(), this.writable = !1, hi(this, t), this.opts = t, this.query = t.query, this.socket = t.socket, this.supportsBinary = !t.forceBase64;
  }
  onError(t, n, s) {
    return super.emitReserved("error", new Ly(t, n, s)), this;
  }
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  send(t) {
    this.readyState === "open" && this.write(t);
  }
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  onData(t) {
    const n = Ya(t, this.socket.binaryType);
    this.onPacket(n);
  }
  onPacket(t) {
    super.emitReserved("packet", t);
  }
  onClose(t) {
    this.readyState = "closed", super.emitReserved("close", t);
  }
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
class Ny extends Za {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  doOpen() {
    this._poll();
  }
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
    } else n();
  }
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  onData(t) {
    const n = (s) => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close") return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(s);
    };
    _y(t, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  doClose() {
    const t = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? t() : this.once("open", t);
  }
  write(t) {
    this.writable = !1, by(t, (n) => {
      this.doWrite(n, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  uri() {
    const t = this.opts.secure ? "https" : "http", n = this.query || {};
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Lp()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(t, n);
  }
}
let Np = !1;
try {
  Np = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Dy = Np;
function $y() {
}
class Py extends Ny {
  constructor(t) {
    if (super(t), typeof location < "u") {
      const n = location.protocol === "https:";
      let s = location.port;
      s || (s = n ? "443" : "80"), this.xd = typeof location < "u" && t.hostname !== location.hostname || s !== t.port;
    }
  }
  doWrite(t, n) {
    const s = this.request({ method: "POST", data: t });
    s.on("success", n), s.on("error", (r, o) => {
      this.onError("xhr post error", r, o);
    });
  }
  doPoll() {
    const t = this.request();
    t.on("data", this.onData.bind(this)), t.on("error", (n, s) => {
      this.onError("xhr poll error", n, s);
    }), this.pollXhr = t;
  }
}
class _n extends Ze {
  constructor(t, n, s) {
    super(), this.createRequest = t, hi(this, s), this._opts = s, this._method = s.method || "GET", this._uri = n, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  _create() {
    var t;
    const n = Ip(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    n.xdomain = !!this._opts.xd;
    const s = this._xhr = this.createRequest(n);
    try {
      s.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
          for (let r in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(r) && s.setRequestHeader(r, this._opts.extraHeaders[r]);
        }
      } catch {
      }
      if (this._method === "POST") try {
        s.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
      } catch {
      }
      try {
        s.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (t = this._opts.cookieJar) === null || t === void 0 || t.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
        var r;
        s.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(s.getResponseHeader("set-cookie"))), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof s.status == "number" ? s.status : 0);
        }, 0));
      }, s.send(this._data);
    } catch (r) {
      this.setTimeoutFn(() => {
        this._onError(r);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = _n.requestsCount++, _n.requests[this._index] = this);
  }
  _onError(t) {
    this.emitReserved("error", t, this._xhr), this._cleanup(!0);
  }
  _cleanup(t) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = $y, t) try {
        this._xhr.abort();
      } catch {
      }
      typeof document < "u" && delete _n.requests[this._index], this._xhr = null;
    }
  }
  _onLoad() {
    const t = this._xhr.responseText;
    t !== null && (this.emitReserved("data", t), this.emitReserved("success"), this._cleanup());
  }
  abort() {
    this._cleanup();
  }
}
if (_n.requestsCount = 0, _n.requests = {}, typeof document < "u") {
  if (typeof attachEvent == "function") attachEvent("onunload", Bc);
  else if (typeof addEventListener == "function") {
    const e = "onpagehide" in Zt ? "pagehide" : "unload";
    addEventListener(e, Bc, !1);
  }
}
function Bc() {
  for (let e in _n.requests) _n.requests.hasOwnProperty(e) && _n.requests[e].abort();
}
const Fy = function() {
  const e = Dp({ xdomain: !1 });
  return e && e.responseType !== null;
}();
class By extends Py {
  constructor(t) {
    super(t);
    const n = t && t.forceBase64;
    this.supportsBinary = Fy && !n;
  }
  request(t = {}) {
    return Object.assign(t, { xd: this.xd }, this.opts), new _n(Dp, this.uri(), t);
  }
}
function Dp(e) {
  const t = e.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!t || Dy)) return new XMLHttpRequest();
  } catch {
  }
  if (!t) try {
    return new Zt[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
  } catch {
  }
}
const $p = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class zy extends Za {
  get name() {
    return "websocket";
  }
  doOpen() {
    const t = this.uri(), n = this.opts.protocols, s = $p ? {} : Ip(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(t, n, s);
    } catch (r) {
      return this.emitReserved("error", r);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (t) => this.onClose({ description: "websocket connection closed", context: t }), this.ws.onmessage = (t) => this.onData(t.data), this.ws.onerror = (t) => this.onError("websocket error", t);
  }
  write(t) {
    this.writable = !1;
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = n === t.length - 1;
      Ga(s, this.supportsBinary, (o) => {
        try {
          this.doWrite(s, o);
        } catch {
        }
        r && di(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  uri() {
    const t = this.opts.secure ? "wss" : "ws", n = this.query || {};
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Lp()), this.supportsBinary || (n.b64 = 1), this.createUri(t, n);
  }
}
const Gi = Zt.WebSocket || Zt.MozWebSocket;
class My extends zy {
  createSocket(t, n, s) {
    return $p ? new Gi(t, n, s) : n ? new Gi(t, n) : new Gi(t);
  }
  doWrite(t, n) {
    this.ws.send(n);
  }
}
class Uy extends Za {
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
  write(t) {
    this.writable = !1;
    for (let n = 0; n < t.length; n++) {
      const s = t[n], r = n === t.length - 1;
      this._writer.write(s).then(() => {
        r && di(() => {
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
const jy = { websocket: My, webtransport: Uy, polling: By }, qy = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Hy = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
function ba(e) {
  if (e.length > 8e3) throw "URI too long";
  const t = e, n = e.indexOf("["), s = e.indexOf("]");
  n != -1 && s != -1 && (e = e.substring(0, n) + e.substring(n, s).replace(/:/g, ";") + e.substring(s, e.length));
  let r = qy.exec(e || ""), o = {}, i = 14;
  for (; i--; ) o[Hy[i]] = r[i] || "";
  return n != -1 && s != -1 && (o.source = t, o.host = o.host.substring(1, o.host.length - 1).replace(/;/g, ":"), o.authority = o.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), o.ipv6uri = !0), o.pathNames = Vy(o, o.path), o.queryKey = Wy(o, o.query), o;
}
function Vy(e, t) {
  const n = /\/{2,9}/g, s = t.replace(n, "/").split("/");
  return (t.slice(0, 1) == "/" || t.length === 0) && s.splice(0, 1), t.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Wy(e, t) {
  const n = {};
  return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, r, o) {
    r && (n[r] = o);
  }), n;
}
const _a = typeof addEventListener == "function" && typeof removeEventListener == "function", Io = [];
_a && addEventListener("offline", () => {
  Io.forEach((e) => e());
}, !1);
class ls extends Ze {
  constructor(t, n) {
    if (super(), this.binaryType = Sy, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, t && typeof t == "object" && (n = t, t = null), t) {
      const s = ba(t);
      n.hostname = s.host, n.secure = s.protocol === "https" || s.protocol === "wss", n.port = s.port, s.query && (n.query = s.query);
    } else n.host && (n.hostname = ba(n.host).host);
    hi(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((s) => {
      const r = s.prototype.name;
      this.transports.push(r), this._transportsByName[r] = s;
    }), this.opts = Object.assign({ path: "/engine.io", agent: !1, withCredentials: !1, upgrade: !0, timestampParam: "t", rememberUpgrade: !1, addTrailingSlash: !0, rejectUnauthorized: !0, perMessageDeflate: { threshold: 1024 }, transportOptions: {}, closeOnBeforeunload: !1 }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = Iy(this.opts.query)), _a && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", { description: "network connection lost" });
    }, Io.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  createTransport(t) {
    const n = Object.assign({}, this.opts.query);
    n.EIO = Op, n.transport = t, this.id && (n.sid = this.id);
    const s = Object.assign({}, this.opts, { query: n, socket: this, hostname: this.hostname, secure: this.secure, port: this.port }, this.opts.transportOptions[t]);
    return new this._transportsByName[t](s);
  }
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const t = this.opts.rememberUpgrade && ls.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const n = this.createTransport(t);
    n.open(), this.setTransport(n);
  }
  setTransport(t) {
    this.transport && this.transport.removeAllListeners(), this.transport = t, t.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (n) => this._onClose("transport close", n));
  }
  onOpen() {
    this.readyState = "open", ls.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  _onPacket(t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") switch (this.emitReserved("packet", t), this.emitReserved("heartbeat"), t.type) {
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
  onHandshake(t) {
    this.emitReserved("handshake", t), this.id = t.sid, this.transport.query.sid = t.sid, this._pingInterval = t.pingInterval, this._pingTimeout = t.pingTimeout, this._maxPayload = t.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const t = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + t, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, t), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const t = this._getWritablePackets();
      this.transport.send(t), this._prevBufferLen = t.length, this.emitReserved("flush");
    }
  }
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
    let t = 1;
    for (let n = 0; n < this.writeBuffer.length; n++) {
      const s = this.writeBuffer[n].data;
      if (s && (t += Ey(s)), n > 0 && t > this._maxPayload) return this.writeBuffer.slice(0, n);
      t += 2;
    }
    return this.writeBuffer;
  }
  _hasPingExpired() {
    if (!this._pingTimeoutTime) return !0;
    const t = Date.now() > this._pingTimeoutTime;
    return t && (this._pingTimeoutTime = 0, di(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), t;
  }
  write(t, n, s) {
    return this._sendPacket("message", t, n, s), this;
  }
  send(t, n, s) {
    return this._sendPacket("message", t, n, s), this;
  }
  _sendPacket(t, n, s, r) {
    if (typeof n == "function" && (r = n, n = void 0), typeof s == "function" && (r = s, s = null), this.readyState === "closing" || this.readyState === "closed") return;
    s = s || {}, s.compress = s.compress !== !1;
    const o = { type: t, data: n, options: s };
    this.emitReserved("packetCreate", o), this.writeBuffer.push(o), r && this.once("flush", r), this.flush();
  }
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
  _onError(t) {
    if (ls.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") return this.transports.shift(), this._open();
    this.emitReserved("error", t), this._onClose("transport error", t);
  }
  _onClose(t, n) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), _a && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = Io.indexOf(this._offlineEventListener);
        s !== -1 && Io.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", t, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
ls.protocol = Op;
class Ky extends ls {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade) for (let t = 0; t < this._upgrades.length; t++) this._probe(this._upgrades[t]);
  }
  _probe(t) {
    let n = this.createTransport(t), s = !1;
    ls.priorWebsocketSuccess = !1;
    const r = () => {
      s || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (_) => {
        if (!s) if (_.type === "pong" && _.data === "probe") {
          if (this.upgrading = !0, this.emitReserved("upgrading", n), !n) return;
          ls.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
            s || this.readyState !== "closed" && (d(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
          });
        } else {
          const w = new Error("probe error");
          w.transport = n.name, this.emitReserved("upgradeError", w);
        }
      }));
    };
    function o() {
      s || (s = !0, d(), n.close(), n = null);
    }
    const i = (_) => {
      const w = new Error("probe error: " + _);
      w.transport = n.name, o(), this.emitReserved("upgradeError", w);
    };
    function a() {
      i("transport closed");
    }
    function l() {
      i("socket closed");
    }
    function c(_) {
      n && _.name !== n.name && o();
    }
    const d = () => {
      n.removeListener("open", r), n.removeListener("error", i), n.removeListener("close", a), this.off("close", l), this.off("upgrading", c);
    };
    n.once("open", r), n.once("error", i), n.once("close", a), this.once("close", l), this.once("upgrading", c), this._upgrades.indexOf("webtransport") !== -1 && t !== "webtransport" ? this.setTimeoutFn(() => {
      s || n.open();
    }, 200) : n.open();
  }
  onHandshake(t) {
    this._upgrades = this._filterUpgrades(t.upgrades), super.onHandshake(t);
  }
  _filterUpgrades(t) {
    const n = [];
    for (let s = 0; s < t.length; s++) ~this.transports.indexOf(t[s]) && n.push(t[s]);
    return n;
  }
}
let Gy = class extends Ky {
  constructor(e, t = {}) {
    const n = typeof e == "object", s = n ? { ...e } : { ...t };
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((r) => jy[r]).filter((r) => !!r)), super(n ? s : e, s);
  }
};
function Yy(e, t = "", n) {
  let s = e;
  n = n || typeof location < "u" && location, e == null && (e = n.protocol + "//" + n.host), typeof e == "string" && (e.charAt(0) === "/" && (e.charAt(1) === "/" ? e = n.protocol + e : e = n.host + e), /^(https?|wss?):\/\//.test(e) || (typeof n < "u" ? e = n.protocol + "//" + e : e = "https://" + e), s = ba(e)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const r = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + r + ":" + s.port + t, s.href = s.protocol + "://" + r + (n && n.port === s.port ? "" : ":" + s.port), s;
}
const Zy = typeof ArrayBuffer == "function", Jy = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Pp = Object.prototype.toString, Qy = typeof Blob == "function" || typeof Blob < "u" && Pp.call(Blob) === "[object BlobConstructor]", Xy = typeof File == "function" || typeof File < "u" && Pp.call(File) === "[object FileConstructor]";
function Ja(e) {
  return Zy && (e instanceof ArrayBuffer || Jy(e)) || Qy && e instanceof Blob || Xy && e instanceof File;
}
function Lo(e, t) {
  if (!e || typeof e != "object") return !1;
  if (Array.isArray(e)) {
    for (let n = 0, s = e.length; n < s; n++) if (Lo(e[n])) return !0;
    return !1;
  }
  if (Ja(e)) return !0;
  if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1) return Lo(e.toJSON(), !0);
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n) && Lo(e[n])) return !0;
  return !1;
}
function eb(e) {
  const t = [], n = e.data, s = e;
  return s.data = No(n, t), s.attachments = t.length, { packet: s, buffers: t };
}
function No(e, t, n) {
  if (!e) return e;
  if (Ja(e)) {
    const s = { _placeholder: !0, num: t.length };
    return t.push(e), s;
  } else if (Array.isArray(e)) {
    const s = new Array(e.length);
    for (let r = 0; r < e.length; r++) s[r] = No(e[r], t);
    return s;
  } else if (typeof e == "object" && !(e instanceof Date)) {
    if (e.toJSON && typeof e.toJSON == "function" && !n) return No(e.toJSON(), t, !0);
    const s = {};
    for (const r in e) Object.prototype.hasOwnProperty.call(e, r) && (s[r] = No(e[r], t));
    return s;
  }
  return e;
}
function tb(e, t) {
  return e.data = wa(e.data, t), delete e.attachments, e;
}
function wa(e, t) {
  if (!e) return e;
  if (e && e._placeholder === !0) {
    if (typeof e.num == "number" && e.num >= 0 && e.num < t.length) return t[e.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(e)) for (let n = 0; n < e.length; n++) e[n] = wa(e[n], t);
  else if (typeof e == "object") for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && (e[n] = wa(e[n], t));
  return e;
}
const nb = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"];
var ke;
(function(e) {
  e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(ke || (ke = {}));
class sb {
  constructor(t) {
    this.replacer = t;
  }
  encode(t) {
    return (t.type === ke.EVENT || t.type === ke.ACK) && Lo(t) ? this.encodeAsBinary({ type: t.type === ke.EVENT ? ke.BINARY_EVENT : ke.BINARY_ACK, nsp: t.nsp, data: t.data, id: t.id }) : [this.encodeAsString(t)];
  }
  encodeAsString(t) {
    let n = "" + t.type;
    return (t.type === ke.BINARY_EVENT || t.type === ke.BINARY_ACK) && (n += t.attachments + "-"), t.nsp && t.nsp !== "/" && (n += t.nsp + ","), t.id != null && (n += t.id), t.data != null && (n += JSON.stringify(t.data, this.replacer)), n;
  }
  encodeAsBinary(t) {
    const n = eb(t), s = this.encodeAsString(n.packet), r = n.buffers;
    return r.unshift(s), r;
  }
}
class Qa extends Ze {
  constructor(t) {
    super(), this.opts = Object.assign({ reviver: void 0, maxAttachments: 10 }, typeof t == "function" ? { reviver: t } : t);
  }
  add(t) {
    let n;
    if (typeof t == "string") {
      if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
      n = this.decodeString(t);
      const s = n.type === ke.BINARY_EVENT;
      s || n.type === ke.BINARY_ACK ? (n.type = s ? ke.EVENT : ke.ACK, this.reconstructor = new rb(n)) : super.emitReserved("decoded", n);
    } else if (Ja(t) || t.base64) if (this.reconstructor) n = this.reconstructor.takeBinaryData(t), n && (this.reconstructor = null, super.emitReserved("decoded", n));
    else throw new Error("got binary data when not reconstructing a packet");
    else throw new Error("Unknown type: " + t);
  }
  decodeString(t) {
    let n = 0;
    const s = { type: Number(t.charAt(0)) };
    if (ke[s.type] === void 0) throw new Error("unknown packet type " + s.type);
    if (s.type === ke.BINARY_EVENT || s.type === ke.BINARY_ACK) {
      const o = n + 1;
      for (; t.charAt(++n) !== "-" && n != t.length; ) ;
      const i = t.substring(o, n);
      if (i != Number(i) || t.charAt(n) !== "-") throw new Error("Illegal attachments");
      const a = Number(i);
      if (!ob(a) || a < 1) throw new Error("Illegal attachments");
      if (a > this.opts.maxAttachments) throw new Error("too many attachments");
      s.attachments = a;
    }
    if (t.charAt(n + 1) === "/") {
      const o = n + 1;
      for (; ++n && !(t.charAt(n) === "," || n === t.length); ) ;
      s.nsp = t.substring(o, n);
    } else s.nsp = "/";
    const r = t.charAt(n + 1);
    if (r !== "" && Number(r) == r) {
      const o = n + 1;
      for (; ++n; ) {
        const i = t.charAt(n);
        if (i == null || Number(i) != i) {
          --n;
          break;
        }
        if (n === t.length) break;
      }
      s.id = Number(t.substring(o, n + 1));
    }
    if (t.charAt(++n)) {
      const o = this.tryParse(t.substr(n));
      if (Qa.isPayloadValid(s.type, o)) s.data = o;
      else throw new Error("invalid payload");
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
      case ke.CONNECT:
        return zc(n);
      case ke.DISCONNECT:
        return n === void 0;
      case ke.CONNECT_ERROR:
        return typeof n == "string" || zc(n);
      case ke.EVENT:
      case ke.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && nb.indexOf(n[0]) === -1);
      case ke.ACK:
      case ke.BINARY_ACK:
        return Array.isArray(n);
    }
  }
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class rb {
  constructor(t) {
    this.packet = t, this.buffers = [], this.reconPack = t;
  }
  takeBinaryData(t) {
    if (this.buffers.push(t), this.buffers.length === this.reconPack.attachments) {
      const n = tb(this.reconPack, this.buffers);
      return this.finishedReconstruction(), n;
    }
    return null;
  }
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const ob = Number.isInteger || function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function zc(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
const ib = Object.freeze(Object.defineProperty({ __proto__: null, Decoder: Qa, Encoder: sb, get PacketType() {
  return ke;
} }, Symbol.toStringTag, { value: "Module" }));
function rn(e, t, n) {
  return e.on(t, n), function() {
    e.off(t, n);
  };
}
const ab = Object.freeze({ connect: 1, connect_error: 1, disconnect: 1, disconnecting: 1, newListener: 1, removeListener: 1 });
class Fp extends Ze {
  constructor(t, n, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = t, this.nsp = n, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open();
  }
  get disconnected() {
    return !this.connected;
  }
  subEvents() {
    if (this.subs) return;
    const t = this.io;
    this.subs = [rn(t, "open", this.onopen.bind(this)), rn(t, "packet", this.onpacket.bind(this)), rn(t, "error", this.onerror.bind(this)), rn(t, "close", this.onclose.bind(this))];
  }
  get active() {
    return !!this.subs;
  }
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  open() {
    return this.connect();
  }
  send(...t) {
    return t.unshift("message"), this.emit.apply(this, t), this;
  }
  emit(t, ...n) {
    var s, r, o;
    if (ab.hasOwnProperty(t)) throw new Error('"' + t.toString() + '" is a reserved event name');
    if (n.unshift(t), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(n), this;
    const i = { type: ke.EVENT, data: n };
    if (i.options = {}, i.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const c = this.ids++, d = n.pop();
      this._registerAckCallback(c, d), i.id = c;
    }
    const a = (r = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || r === void 0 ? void 0 : r.writable, l = this.connected && !(!((o = this.io.engine) === null || o === void 0) && o._hasPingExpired());
    return this.flags.volatile && !a || (l ? (this.notifyOutgoingListeners(i), this.packet(i)) : this.sendBuffer.push(i)), this.flags = {}, this;
  }
  _registerAckCallback(t, n) {
    var s;
    const r = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (r === void 0) {
      this.acks[t] = n;
      return;
    }
    const o = this.io.setTimeoutFn(() => {
      delete this.acks[t];
      for (let a = 0; a < this.sendBuffer.length; a++) this.sendBuffer[a].id === t && this.sendBuffer.splice(a, 1);
      n.call(this, new Error("operation has timed out"));
    }, r), i = (...a) => {
      this.io.clearTimeoutFn(o), n.apply(this, a);
    };
    i.withError = !0, this.acks[t] = i;
  }
  emitWithAck(t, ...n) {
    return new Promise((s, r) => {
      const o = (i, a) => i ? r(i) : s(a);
      o.withError = !0, n.push(o), this.emit(t, ...n);
    });
  }
  _addToQueue(t) {
    let n;
    typeof t[t.length - 1] == "function" && (n = t.pop());
    const s = { id: this._queueSeq++, tryCount: 0, pending: !1, args: t, flags: Object.assign({ fromQueue: !0 }, this.flags) };
    t.push((r, ...o) => (this._queue[0], r !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), n && n(r)) : (this._queue.shift(), n && n(null, ...o)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
  }
  _drainQueue(t = !1) {
    if (!this.connected || this._queue.length === 0) return;
    const n = this._queue[0];
    n.pending && !t || (n.pending = !0, n.tryCount++, this.flags = n.flags, this.emit.apply(this, n.args));
  }
  packet(t) {
    t.nsp = this.nsp, this.io._packet(t);
  }
  onopen() {
    typeof this.auth == "function" ? this.auth((t) => {
      this._sendConnectPacket(t);
    }) : this._sendConnectPacket(this.auth);
  }
  _sendConnectPacket(t) {
    this.packet({ type: ke.CONNECT, data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, t) : t });
  }
  onerror(t) {
    this.connected || this.emitReserved("connect_error", t);
  }
  onclose(t, n) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", t, n), this._clearAcks();
  }
  _clearAcks() {
    Object.keys(this.acks).forEach((t) => {
      if (!this.sendBuffer.some((n) => String(n.id) === t)) {
        const n = this.acks[t];
        delete this.acks[t], n.withError && n.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  onpacket(t) {
    if (t.nsp === this.nsp) switch (t.type) {
      case ke.CONNECT:
        t.data && t.data.sid ? this.onconnect(t.data.sid, t.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        break;
      case ke.EVENT:
      case ke.BINARY_EVENT:
        this.onevent(t);
        break;
      case ke.ACK:
      case ke.BINARY_ACK:
        this.onack(t);
        break;
      case ke.DISCONNECT:
        this.ondisconnect();
        break;
      case ke.CONNECT_ERROR:
        this.destroy();
        const n = new Error(t.data.message);
        n.data = t.data.data, this.emitReserved("connect_error", n);
        break;
    }
  }
  onevent(t) {
    const n = t.data || [];
    t.id != null && n.push(this.ack(t.id)), this.connected ? this.emitEvent(n) : this.receiveBuffer.push(Object.freeze(n));
  }
  emitEvent(t) {
    if (this._anyListeners && this._anyListeners.length) {
      const n = this._anyListeners.slice();
      for (const s of n) s.apply(this, t);
    }
    super.emit.apply(this, t), this._pid && t.length && typeof t[t.length - 1] == "string" && (this._lastOffset = t[t.length - 1]);
  }
  ack(t) {
    const n = this;
    let s = !1;
    return function(...r) {
      s || (s = !0, n.packet({ type: ke.ACK, id: t, data: r }));
    };
  }
  onack(t) {
    const n = this.acks[t.id];
    typeof n == "function" && (delete this.acks[t.id], n.withError && t.data.unshift(null), n.apply(this, t.data));
  }
  onconnect(t, n) {
    this.id = t, this.recovered = n && this._pid === n, this._pid = n, this.connected = !0, this.emitBuffered(), this._drainQueue(!0), this.emitReserved("connect");
  }
  emitBuffered() {
    this.receiveBuffer.forEach((t) => this.emitEvent(t)), this.receiveBuffer = [], this.sendBuffer.forEach((t) => {
      this.notifyOutgoingListeners(t), this.packet(t);
    }), this.sendBuffer = [];
  }
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  destroy() {
    this.subs && (this.subs.forEach((t) => t()), this.subs = void 0), this.io._destroy(this);
  }
  disconnect() {
    return this.connected && this.packet({ type: ke.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  close() {
    return this.disconnect();
  }
  compress(t) {
    return this.flags.compress = t, this;
  }
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  timeout(t) {
    return this.flags.timeout = t, this;
  }
  onAny(t) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(t), this;
  }
  prependAny(t) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(t), this;
  }
  offAny(t) {
    if (!this._anyListeners) return this;
    if (t) {
      const n = this._anyListeners;
      for (let s = 0; s < n.length; s++) if (t === n[s]) return n.splice(s, 1), this;
    } else this._anyListeners = [];
    return this;
  }
  listenersAny() {
    return this._anyListeners || [];
  }
  onAnyOutgoing(t) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(t), this;
  }
  prependAnyOutgoing(t) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(t), this;
  }
  offAnyOutgoing(t) {
    if (!this._anyOutgoingListeners) return this;
    if (t) {
      const n = this._anyOutgoingListeners;
      for (let s = 0; s < n.length; s++) if (t === n[s]) return n.splice(s, 1), this;
    } else this._anyOutgoingListeners = [];
    return this;
  }
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  notifyOutgoingListeners(t) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const n = this._anyOutgoingListeners.slice();
      for (const s of n) s.apply(this, t.data);
    }
  }
}
function Js(e) {
  e = e || {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
Js.prototype.duration = function() {
  var e = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var t = Math.random(), n = Math.floor(t * this.jitter * e);
    e = (Math.floor(t * 10) & 1) == 0 ? e - n : e + n;
  }
  return Math.min(e, this.max) | 0;
}, Js.prototype.reset = function() {
  this.attempts = 0;
}, Js.prototype.setMin = function(e) {
  this.ms = e;
}, Js.prototype.setMax = function(e) {
  this.max = e;
}, Js.prototype.setJitter = function(e) {
  this.jitter = e;
};
class ka extends Ze {
  constructor(t, n) {
    var s;
    super(), this.nsps = {}, this.subs = [], t && typeof t == "object" && (n = t, t = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, hi(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((s = n.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new Js({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = t;
    const r = n.parser || ib;
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
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  open(t) {
    if (~this._readyState.indexOf("open")) return this;
    this.engine = new Gy(this.uri, this.opts);
    const n = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const r = rn(n, "open", function() {
      s.onopen(), t && t();
    }), o = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), t ? t(a) : this.maybeReconnectOnOpen();
    }, i = rn(n, "error", o);
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
  connect(t) {
    return this.open(t);
  }
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const t = this.engine;
    this.subs.push(rn(t, "ping", this.onping.bind(this)), rn(t, "data", this.ondata.bind(this)), rn(t, "error", this.onerror.bind(this)), rn(t, "close", this.onclose.bind(this)), rn(this.decoder, "decoded", this.ondecoded.bind(this)));
  }
  onping() {
    this.emitReserved("ping");
  }
  ondata(t) {
    try {
      this.decoder.add(t);
    } catch (n) {
      this.onclose("parse error", n);
    }
  }
  ondecoded(t) {
    di(() => {
      this.emitReserved("packet", t);
    }, this.setTimeoutFn);
  }
  onerror(t) {
    this.emitReserved("error", t);
  }
  socket(t, n) {
    let s = this.nsps[t];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Fp(this, t, n), this.nsps[t] = s), s;
  }
  _destroy(t) {
    const n = Object.keys(this.nsps);
    for (const s of n) if (this.nsps[s].active) return;
    this._close();
  }
  _packet(t) {
    const n = this.encoder.encode(t);
    for (let s = 0; s < n.length; s++) this.engine.write(n[s], t.options);
  }
  cleanup() {
    this.subs.forEach((t) => t()), this.subs.length = 0, this.decoder.destroy();
  }
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  disconnect() {
    return this._close();
  }
  onclose(t, n) {
    var s;
    this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", t, n), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  reconnect() {
    if (this._reconnecting || this.skipReconnect) return this;
    const t = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
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
  onreconnect() {
    const t = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", t);
  }
}
const Sr = {};
function Do(e, t) {
  typeof e == "object" && (t = e, e = void 0), t = t || {};
  const n = Yy(e, t.path || "/socket.io"), s = n.source, r = n.id, o = n.path, i = Sr[r] && o in Sr[r].nsps, a = t.forceNew || t["force new connection"] || t.multiplex === !1 || i;
  let l;
  return a ? l = new ka(s, t) : (Sr[r] || (Sr[r] = new ka(s, t)), l = Sr[r]), n.query && !t.query && (t.query = n.queryKey), l.socket(n.path, t);
}
Object.assign(Do, { Manager: ka, Socket: Fp, io: Do, connect: Do });
const lb = 5e3;
function cb() {
  const e = te([]), t = te(!1), n = te(""), s = te(!1), r = te(!1), o = te(!1), i = te("connecting"), a = te(0), l = 5, c = te({}), d = te(null), _ = te(""), w = [];
  let k = null;
  const C = 6e4, M = () => {
    t.value = !1, k && (clearTimeout(k), k = null);
  }, K = () => {
    t.value = !0, k && clearTimeout(k), k = setTimeout(M, C);
  };
  let x = null;
  const G = 1e3, Z = 15e3;
  let E = null;
  const U = /* @__PURE__ */ new Set(["ai_config_missing", ...Zu]);
  let T = !1, J = !1;
  const se = te(null), ie = () => {
    E && (clearTimeout(E), E = null);
  }, ce = () => {
    if (E || T) return;
    const D = Math.min(G * 2 ** Math.max(0, a.value - 1), Z);
    E = setTimeout(() => {
      E = null, x == null || x.connect();
    }, D);
  };
  let Ce = null, Ke = null, ot = null, Xe = null, Ne = null, ge = !1, ye = null, ft, Et, mt;
  const _t = (D) => {
    var R;
    return (R = Ro(D ?? null)) == null ? void 0 : R.sub;
  }, Ge = (D) => {
    ft = D, D && (x != null && x.connected) && x.emit("refresh_token", { conversation_token: D });
  }, jn = (D) => {
    Et = D;
  }, kn = () => {
    var Q;
    const D = ft || (Jo() ? null : Zo().read()), R = {};
    D && (R.conversation_token = D), Et && (R.widget_id = Et);
    try {
      R.page_url = kp() || (window.parent !== window && ((Q = window.parent.location) != null && Q.href) ? window.parent.location.href : document.referrer || window.location.href);
    } catch {
      R.page_url = document.referrer || "";
    }
    return R;
  }, Re = (D) => {
    x = Do(`${Ds.WS_URL}/widget`, { transports: ["websocket"], reconnection: !0, reconnectionAttempts: 1 / 0, reconnectionDelay: 1e3, reconnectionDelayMax: 15e3, auth: (R) => R(kn()) }), x.on("connect", () => {
      mt = _t(kn().conversation_token), i.value = "connected", ie(), a.value = 0;
    }), x.on("bot_typing", () => {
      K();
    }), x.on("disconnect", (R) => {
      M(), i.value === "connected" && (console.log("Socket disconnected, setting connection status to connecting"), i.value = "connecting");
      const Q = J;
      J = !1, R === "io server disconnect" && Q && (x == null || x.connect());
    }), x.on("error", (R) => {
      (R == null ? void 0 : R.type) === "conversation_gone" && (J = !0);
    }), x.on("connect_error", (R) => {
      var le;
      const Q = (le = R == null ? void 0 : R.data) == null ? void 0 : le.type;
      if (Q && U.has(Q)) {
        T = !0, se.value = Q, ie(), i.value = "failed", la(Q) ? ge || (Ne == null || Ne()) : I(R.data);
        return;
      }
      a.value++, console.error("Socket connection failed, attempt:", a.value), a.value >= l && (i.value = "failed"), x && !x.active && ce();
    }), x.on("chat_response", (R) => {
      if (M(), R.session_id ? (console.log("Captured session_id from chat_response:", R.session_id), _.value = R.session_id) : console.warn("No session_id in chat_response data:", R), R.type === "agent_message") {
        const Q = { message: R.message, message_type: "agent", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", agent_name: R.agent_name, stream: !0, attributes: { end_chat: R.end_chat, end_chat_reason: R.end_chat_reason, end_chat_description: R.end_chat_description, request_rating: R.request_rating } };
        R.attachments && Array.isArray(R.attachments) && (Q.id = R.message_id, Q.attachments = R.attachments.map((le, xe) => ({ id: R.message_id * 1e3 + xe, filename: le.filename, file_url: le.file_url, content_type: le.content_type, file_size: le.file_size }))), e.value.push(Q);
      } else R.shopify_output && typeof R.shopify_output == "object" && R.shopify_output.products ? e.value.push({ message: R.message, message_type: "product", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", agent_name: R.agent_name, shopify_output: R.shopify_output, attributes: { end_chat: R.end_chat, request_rating: R.request_rating } }) : e.value.push({ message: R.message, message_type: "bot", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", agent_name: R.agent_name, stream: !0, sources: Array.isArray(R.sources) && R.sources.length ? R.sources : void 0, attributes: { end_chat: R.end_chat, end_chat_reason: R.end_chat_reason, end_chat_description: R.end_chat_description, request_rating: R.request_rating } });
    }), x.on("handle_taken_over", (R) => {
      e.value.push({ message: `${R.user_name} joined the conversation`, message_type: "system", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: R.session_id }), c.value = { ...c.value, human_agent_name: R.user_name, human_agent_profile_pic: R.profile_picture }, M(), Ce && Ce(R);
    }), x.on("session_initialized", (R) => {
      R.session_id && (_.value = R.session_id, ye = { session_id: R.session_id, authenticated: !!R.authenticated, created: !!R.created }, Xe == null || Xe(ye));
    }), x.on("error", I);
    for (const [R, Q] of w) x.on(R, Q);
    return x.on("chat_history", B), x.on("rating_submitted", L), x.on("display_form", $), x.on("form_submitted", F), x.on("workflow_state", j), x.on("workflow_proceeded", z), x;
  }, ct = async () => {
    try {
      return x != null && x.connected && mt && mt === _t(kn().conversation_token) ? (i.value = "connected", !0) : (i.value = "connecting", a.value = 0, M(), ie(), T = !1, se.value = null, x && (x.removeAllListeners(), x.disconnect(), x = null), ge = !0, x = Re(""), new Promise((D) => {
        const R = (Q) => {
          ge = !1, D(Q);
        };
        x == null || x.on("connect", () => {
          R(!0);
        }), x == null || x.on("connect_error", () => {
          (T || a.value >= l) && R(!1);
        });
      }));
    } catch (D) {
      return console.error("Socket initialization failed:", D), ge = !1, i.value = "failed", !1;
    }
  }, an = () => (x && x.disconnect(), ct()), xn = (D) => {
    Ce = D;
  }, qn = (D) => {
    Ne = D;
  }, Xt = (D) => {
    Xe = D, ye && D(ye);
  }, g = (D) => {
    Ke = D;
  }, y = (D) => {
    ot = D;
  }, I = (D) => {
    M(), n.value = Lf(D), s.value = !0, setTimeout(() => {
      s.value = !1, n.value = "";
    }, 5e3);
  }, B = (D) => {
    if (D.type === "chat_history" && Array.isArray(D.messages)) {
      const R = D.messages.map((Q) => {
        var xe, Te;
        const le = { message: Q.message, message_type: Q.message_type, created_at: Q.created_at, session_id: "", agent_name: Q.agent_name || "", user_name: Q.user_name || "", attributes: Q.attributes || {}, attachments: Q.attachments || [] };
        return Array.isArray((xe = Q.attributes) == null ? void 0 : xe.sources) && Q.attributes.sources.length && (le.sources = Q.attributes.sources), (Te = Q.attributes) != null && Te.shopify_output && typeof Q.attributes.shopify_output == "object" ? { ...le, message_type: "product", shopify_output: Q.attributes.shopify_output } : le;
      });
      e.value = [...R.filter((Q) => !e.value.some((le) => le.message === Q.message && le.created_at === Q.created_at)), ...e.value];
    }
  }, L = (D) => {
    D.success && e.value.push({ message: "Thank you for your feedback!", message_type: "system", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "" });
  }, $ = (D) => {
    var R;
    console.log("Form display handler in composable:", D), M(), d.value = D.form_data, console.log("Set currentForm in handleDisplayForm:", d.value), ((R = D.form_data) == null ? void 0 : R.form_full_screen) === !0 ? (console.log("Full screen form detected, triggering workflow state callback"), Ke && Ke({ type: "form", form_data: D.form_data, session_id: D.session_id })) : e.value.push({ message: "", message_type: "form", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: D.session_id, attributes: { form_data: D.form_data } });
  }, F = (D) => {
    console.log("Form submitted confirmation received, clearing currentForm"), d.value = null, D.success && console.log("Form submitted successfully");
  }, j = (D) => {
    console.log("Workflow state received in composable:", D), (D.type === "form" || D.type === "display_form") && (console.log("Setting currentForm from workflow state:", D.form_data), d.value = D.form_data), Ke && Ke(D);
  }, z = (D) => {
    console.log("Workflow proceeded in composable:", D), ot && ot(D);
  }, P = async (D, R) => {
    !x || !D || x.emit("submit_rating", { rating: D, feedback: R });
  }, ee = async (D) => {
    var Q;
    if (console.log("Submitting form in socket:", D), console.log("Current form in socket:", d.value), console.log("Socket in socket:", x), !x) {
      console.error("No socket available for form submission");
      return;
    }
    if (!D || Object.keys(D).length === 0) {
      console.error("No form data to submit");
      return;
    }
    const R = ((Q = d.value) == null ? void 0 : Q.form_type) === "contact" ? "submit_contact_info" : "submit_form";
    console.log(`Emitting ${R} event with data:`, D), x.emit(R, { form_data: D }), d.value = null;
  }, H = async () => {
    x && (console.log("Getting workflow state 12"), x.emit("get_workflow_state"));
  }, re = async () => {
    x && x.emit("proceed_workflow", {});
  }, X = async (D, R, Q = [], le = {}) => {
    if (!x || !D.trim() && Q.length === 0) return;
    const xe = { message: D, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "" };
    Q.length > 0 && (xe.attachments = Q.map((Te, et) => {
      let tt = "";
      if (Te.content_type.startsWith("image/")) {
        const De = atob(Te.content), Ye = new Array(De.length);
        for (let en = 0; en < De.length; en++) Ye[en] = De.charCodeAt(en);
        const Ut = new Uint8Array(Ye), ln = new Blob([Ut], { type: Te.content_type });
        tt = URL.createObjectURL(ln);
      }
      return { id: Date.now() * 1e3 + et, filename: Te.filename, file_url: tt, content_type: Te.content_type, file_size: Te.size, _isTemporary: !0 };
    })), e.value.push(xe), x.emit("chat", { ...le, message: D, email: R, files: Q }), o.value = !0;
  }, he = () => {
    e.value = [], o.value = !1, _.value = "", M(), d.value = null;
  };
  return { messages: e, loading: t, errorMessage: n, showError: s, loadingHistory: r, hasStartedChat: o, connectionStatus: i, sendMessage: X, endChat: (D = "CUSTOMER_REQUEST") => new Promise((R) => {
    if (!x || !x.connected) {
      R(!1);
      return;
    }
    let Q = !1;
    const le = (tt) => {
      Q || (Q = !0, clearTimeout(et), x == null || x.off("chat_ended", xe), x == null || x.off("error", Te), tt && he(), R(tt));
    }, xe = () => le(!0), Te = (tt) => {
      (tt == null ? void 0 : tt.type) === "end_chat_error" && le(!1);
    }, et = setTimeout(() => le(!1), lb);
    x.on("chat_ended", xe), x.on("error", Te), x.emit("end_chat", { reason: D });
  }), loadChatHistory: async () => {
    if (x) try {
      r.value = !0, x.emit("get_chat_history");
    } catch (D) {
      console.error("Failed to load chat history:", D);
    } finally {
      r.value = !1;
    }
  }, connect: ct, reconnect: an, cleanup: () => {
    M(), ie(), x && (x.removeAllListeners(), x.disconnect(), x = null), Ce = null, Ke = null, ot = null;
  }, humanAgent: c, onTakeover: xn, onSessionState: Xt, onReauthorize: qn, refusal: se, submitRating: P, currentForm: d, submitForm: ee, getWorkflowState: H, proceedWorkflow: re, onWorkflowState: g, onWorkflowProceeded: y, currentSessionId: _, setToken: Ge, setWidgetId: jn, on: (D, R) => {
    w.push([D, R]), x == null || x.on(D, R);
  }, emit: (D, R) => {
    x == null || x.emit(D, R);
  } };
}
const ub = 8, pb = 200;
function db(e) {
  const t = e && typeof e == "object" ? e.details : null;
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = Object.entries(t).filter(([s, r]) => s.trim() && ["string", "number", "boolean"].includes(typeof r) && String(r).trim()).slice(0, ub).map(([s, r]) => ({ key: s.trim().slice(0, 60), value: String(r).trim().slice(0, pb) }));
  return n.length ? n : null;
}
const hb = 140;
function fb(e) {
  const t = e && typeof e == "object" ? e.summary : null;
  return typeof t == "string" && t.trim() ? t.trim().slice(0, hb) : null;
}
const mb = 2e3, gb = 4;
function vb(e) {
  if (typeof e.message != "string" || !e.message.trim()) return null;
  const t = Array.isArray(e.suggestions) ? e.suggestions.filter((n) => typeof n == "string" && !!n.trim()).map((n) => ({ label: n.slice(0, 80), kind: "text", value: n.slice(0, 500) })).slice(0, gb) : [];
  return { message: e.message.slice(0, mb), chips: t, open: e.open === !0, source: "host" };
}
const yb = 2e3;
function bb(e) {
  const t = e.setTimer ?? ((T, J) => setTimeout(T, J)), n = e.clearTimer ?? ((T) => clearTimeout(T));
  let s = [], r = null, o = null;
  const i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  function c() {
    const T = e.trustedHostOrigin();
    T && s.length && e.emit("actions_available", { names: s, host_origin: T }), r && e.emit("set_context", { context: r });
  }
  function d(T) {
    s = Array.isArray(T) ? T.filter((J) => typeof J == "string") : [], c();
  }
  function _(T) {
    r = T && typeof T == "object" && !Array.isArray(T) ? T : null, r && e.emit("set_context", { context: r });
  }
  function w(T, J, se, ie = {}) {
    var ce;
    (ce = e.onOutcome) == null || ce.call(e, { label: T, status: J, preview: se, summary: J === "ok" ? fb(ie.result) : null, error: typeof ie.error == "string" && ie.error ? ie.error : null });
  }
  function k(T, J, se = {}) {
    const ie = i.get(T);
    ie && (n(ie.timer), w(ie.label, J, ie.preview, se)), i.delete(T);
    const ce = a.get(T);
    if (ce) {
      a.delete(T), ce(J);
      return;
    }
    const Ce = (ie == null ? void 0 : ie.confirmed) ?? void 0;
    e.emit("action_result", { call_id: T, status: J, confirmed: Ce, ...se });
  }
  function C(T) {
    const J = o && T ? a.get(o.request.call_id) : void 0;
    J && o && (a.delete(o.request.call_id), J("declined")), o = T, e.onConfirmChange(T);
  }
  function M(T, J, se = null) {
    const ie = Math.max(1, T.timeout_s) * 1e3 + yb;
    i.set(T.call_id, { timer: t(() => k(T.call_id, "timeout"), ie), confirmed: J, label: T.label, preview: se }), e.postToHost({ type: "ACTION_RUN", callId: T.call_id, name: T.name, args: T.args, timeoutS: T.timeout_s });
  }
  function K(T) {
    if (!(!T || typeof T.call_id != "string") && !(i.has(T.call_id) || l.has(T.call_id) || (o == null ? void 0 : o.request.call_id) === T.call_id)) {
      if (T.confirm === "always") {
        C({ request: T, preview: null, details: null }), l.set(T.call_id, T), e.postToHost({ type: "ACTION_PREVIEW", callId: T.call_id, name: T.name, args: T.args });
        return;
      }
      if (T.confirm === "when_overwriting") {
        l.set(T.call_id, T), e.postToHost({ type: "ACTION_PREVIEW", callId: T.call_id, name: T.name, args: T.args });
        return;
      }
      M(T, null);
    }
  }
  function x(T) {
    var J;
    switch (T.type) {
      case "HOST_ACTIONS":
        return d(T.names), !0;
      case "HOST_CONTEXT":
        return _(T.context), !0;
      case "HOST_PROMPT": {
        const se = vb(T);
        return se && ((J = e.onPrompt) == null || J.call(e, se)), !0;
      }
      case "ACTION_PREVIEW_DONE": {
        const se = l.get(String(T.callId));
        if (!se) return !0;
        if (l.delete(se.call_id), se.confirm === "always") {
          const ce = db(T.preview);
          return ce && (o == null ? void 0 : o.request.call_id) === se.call_id && (o = { ...o, details: ce }, e.onConfirmChange(o)), !0;
        }
        const ie = T.preview;
        return ie && typeof ie == "object" ? C({ request: se, preview: ie, details: null }) : M(se, null), !0;
      }
      case "ACTION_DONE": {
        const se = String(T.callId);
        if (!i.has(se)) return !0;
        const ie = ["ok", "error", "timeout"].includes(T.status) ? T.status : "error";
        return k(se, ie, { result: ie === "ok" ? T.result : void 0, error: typeof T.error == "string" ? T.error : void 0 }), !0;
      }
      default:
        return !1;
    }
  }
  function G() {
    if (!o) return;
    const { request: T, preview: J } = o;
    C(null), l.delete(T.call_id), M(T, !0, J);
  }
  function Z() {
    if (!o) return;
    const { request: T, preview: J } = o;
    C(null), l.delete(T.call_id), w(T.label, "declined", J);
    const se = a.get(T.call_id);
    if (se) {
      a.delete(T.call_id), se("declined");
      return;
    }
    e.emit("action_result", { call_id: T.call_id, status: "declined", confirmed: !1 });
  }
  function E(T, J) {
    if (T.kind !== "action" || !T.action || o || a.size > 0 || i.size > 0 || l.size > 0) return !1;
    const se = `chip-${T.value}-${Date.now()}`;
    return a.set(se, J), K({ call_id: se, name: T.value, label: T.action.label, args: {}, confirm: T.action.confirm, timeout_s: T.action.timeout_s }), !0;
  }
  function U() {
    for (const T of i.values()) n(T.timer);
    i.clear(), l.clear(), a.clear(), C(null);
  }
  return { announce: c, handleRequest: K, handleHostMessage: x, approve: G, decline: Z, runLocal: E, dispose: U };
}
function _b(e, t, n) {
  const s = te(null), r = bb({ postToHost: st, emit: e.emit, trustedHostOrigin: () => {
    if (!Jo()) return null;
    const i = pp();
    return i === "*" ? null : i;
  }, onConfirmChange: (i) => {
    s.value = i;
  }, onPrompt: t, onOutcome: n });
  e.on("action_request", (i) => r.handleRequest(i)), e.on("session_initialized", () => r.announce());
  const o = (i) => {
    i.source === window.parent && (!i.data || typeof i.data.type != "string" || r.handleHostMessage(i.data));
  };
  return window.addEventListener("message", o), ii(() => {
    window.removeEventListener("message", o), r.dispose();
  }), { pendingConfirm: s, approveAction: r.approve, declineAction: r.decline, runLocalAction: r.runLocal };
}
function Mc(e, t) {
  var r;
  const n = (r = e.step_titles) != null && r.length ? e.step_titles : [], s = n.length || e.step_count;
  return { name: e.journey_name, index: t ? s : e.step_index ?? 0, count: s, titles: n, title: e.title ?? n[e.step_index ?? 0] ?? "", skippable: !t && !e.waiting && !!e.skippable, finished: t };
}
const wb = 6e4;
function kb(e) {
  const t = e.setTimer ?? ((k, C) => setTimeout(k, C)), n = e.clearTimer ?? ((k) => clearTimeout(k));
  let s = null, r = null;
  function o() {
    s !== null && n(s), s = null;
  }
  let i = null, a = null;
  function l() {
    o();
    const k = a;
    !k || r === k.stepId || (i = k.stepId, s = t(() => {
      s = null, r = k.stepId, e.addNotice(k.nudge.message, "message");
    }, k.nudge.after_min * wb));
  }
  function c(k) {
    if (a = k.nudge && k.step_id ? { stepId: k.step_id, nudge: k.nudge } : null, !a) {
      o(), i = null;
      return;
    }
    i === a.stepId && s !== null || l();
  }
  let d = !1;
  function _(k) {
    var K;
    const C = (k == null ? void 0 : k.view) ?? null;
    if ((K = C == null ? void 0 : C.notice) != null && K.text && e.addNotice(C.notice.text, C.notice.kind), !C && d) return;
    if (d = !!(C != null && C.finished) && !!C.journey_name, !C || C.finished || C.waiting) {
      o(), a = null, i = null;
      const x = C != null && C.journey_name ? Mc(C, !!C.finished) : null;
      e.showStep(null, x), C != null && C.finished && C.message && e.addNotice(C.message, "message");
      return;
    }
    const M = C.message ? { message: C.message, chips: C.chips ?? [], open: !1, source: "journey" } : null;
    e.showStep(M, Mc(C, !1)), C.fresh && C.auto_open && e.openChat(), c(C);
  }
  function w() {
    s !== null && l();
  }
  return { handleState: _, activity: w, sync: (k = {}) => e.emit("journey_sync", k), skip: () => e.emit("journey_skip", {}), dismiss: () => {
    d = !1, e.showStep(null, null), e.emit("journey_dismiss", {});
  }, start: (k) => e.emit("journey_start", { key: k }), dispose: o };
}
function xb(e) {
  const t = te(null), n = te(!1);
  let s = !1;
  const r = [], o = kb({ emit: (l, c) => {
    s ? e.emit(l, c) : r.push([l, c]);
  }, showStep: (l, c) => {
    t.value = c;
    const d = e.currentPrompt();
    d && d.source !== "journey" || e.showPrompt(l);
  }, addNotice: e.addNotice, openChat: () => st({ type: "WIDGET_OPEN_REQUEST" }) });
  e.on("journey_state", o.handleState), e.on("session_initialized", () => {
    s = !0, o.sync({ url: kp() });
    for (const [l, c] of r.splice(0)) e.emit(l, c);
  });
  const i = (l) => {
    if (l.source !== window.parent) return;
    const c = l.data;
    !c || typeof c.type != "string" || (c.type === "HOST_PAGE" && typeof c.url == "string" && o.sync({ url: c.url }), c.type === "HOST_CONTEXT" && o.sync({}), c.type === "HOST_EVENT" && typeof c.event == "string" && o.sync({ event: c.event }), c.type === "HOST_JOURNEY_START" && typeof c.key == "string" && o.start(c.key));
  };
  window.addEventListener("message", i);
  function a(l, c) {
    if (o.activity(), l.kind === "text") {
      c(l.value);
      return;
    }
    n.value || e.runLocalAction(l, (d) => {
      n.value = !1, d === "ok" && o.sync({ action: l.value });
    }) && (n.value = !0);
  }
  return ii(() => {
    window.removeEventListener("message", i), o.dispose();
  }), { journeyProgress: t, chipBusy: n, runChip: a, skipStep: o.skip, dismissJourney: o.dismiss, noteActivity: o.activity };
}
const bo = (e, t) => we(e) === we(t);
function Sb(e, t) {
  let n;
  const s = qd(null), r = () => {
    n = e.value[e.value.length - 1], s.value = null;
  };
  return We(() => {
    var o;
    return (o = t.value) == null ? void 0 : o.message;
  }, r), We(e, (o) => {
    (!s.value || !o.some((i) => bo(i, s.value))) && r();
  }, { flush: "sync" }), We(() => e.value.length, () => {
    if (!t.value || s.value) return;
    const o = e.value, i = o[o.findIndex((a) => bo(a, n)) + 1];
    i && (s.value = i);
  }), { isBefore: (o) => !!t.value && bo(o, s.value), isLast: () => !!t.value && !s.value, index: () => {
    const o = e.value.findIndex((i) => bo(i, s.value));
    return o === -1 ? e.value.length : o;
  } };
}
const Xa = "https://fonts.googleapis.com/css2", Tb = `${Xa}?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap`, Ab = ["space grotesk", "instrument sans", "jetbrains mono"];
function Cb(e) {
  return (e == null ? void 0 : e.split(",")[0].trim().replace(/['"]/g, "")) || "";
}
function Eb(e) {
  return `${Xa}?family=${encodeURIComponent(e).replace(/%20/g, "+")}&display=swap`;
}
function Uc(e, t) {
  if (Array.from(e.querySelectorAll('link[rel="stylesheet"]')).some((s) => s.getAttribute("href") === t)) return;
  const n = e.createElement("link");
  n.rel = "stylesheet", n.href = t, e.head.appendChild(n);
}
function Rb(e) {
  return e.includes(",") ? e : `"${e}", system-ui, sans-serif`;
}
function Ob(e, t, n = document) {
  Array.from(n.querySelectorAll('link[rel="stylesheet"]')).some((o) => (o.getAttribute("href") || "").startsWith(`${Xa}?family=Space+Grotesk`)) || Uc(n, Tb);
  const s = Cb(e);
  if (!s || Ab.includes(s.toLowerCase())) {
    t();
    return;
  }
  Uc(n, Eb(s));
  const r = n.fonts;
  if (!(r != null && r.load)) {
    t();
    return;
  }
  r.load(`1em "${s}"`).then(t, t);
}
const Ib = (e) => {
  Ob(e, () => {
    if (!e) return;
    const t = document.querySelector(".chat-container");
    t && (t.style.fontFamily = Rb(e));
  });
};
function Lb() {
  const e = te({}), t = te(""), n = (s) => {
    var r, o;
    e.value = s, s.photo_url && (e.value.photo_url = s.photo_url), Ib(s.font_family), st({ type: "CUSTOMIZATION_UPDATE", data: { chat_bubble_color: s.chat_bubble_color || va, chat_style: s.chat_style, chat_initiation_messages: s.chat_initiation_messages || [], widget_display: (r = s.customization_metadata) == null ? void 0 : r.widget_display, launcher: (o = s.customization_metadata) == null ? void 0 : o.launcher, launcher_logo_url: s.launcher_logo_url } });
  };
  return { customization: e, agentName: t, applyCustomization: n, initializeFromData: () => {
    const s = window.__INITIAL_DATA__;
    s && (n(s.customization || {}), t.value = s.agentName || "");
  } };
}
function Nb(e, t) {
  const n = window.__INITIAL_DATA__, s = n == null ? void 0 : n.widgetData;
  if (!n || !s || (delete n.widgetData, t || (e || "") !== (n.initialToken || ""))) return null;
  const r = "data" in s ? s.data : { detail: s.detail };
  return new Response(JSON.stringify(r), { status: s.status, headers: { "Content-Type": "application/json" } });
}
const Db = 13, $b = 24;
function Pb(e, t) {
  const n = qr(/* @__PURE__ */ new Map()), s = [];
  let r = null;
  const o = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, i = (_) => {
    r || s.length === 0 || (r = setTimeout(a, _));
  }, a = () => {
    r = null;
    const _ = s[0];
    if (_ === void 0) return;
    const w = n.get(_), k = (_ == null ? void 0 : _.message) ?? "";
    if (!w) {
      s.shift(), i(0);
      return;
    }
    if (w.shown >= k.length) {
      w.done = !0, s.shift(), i(0);
      return;
    }
    w.shown += 1;
    const C = k[w.shown - 1];
    t == null || t(), i(C === " " ? $b : Db);
  };
  We(() => [...e.value], (_) => {
    const w = new Set(_.map((k) => we(k)));
    for (const k of [...n.keys()]) w.has(we(k)) || n.delete(k);
    for (let k = s.length - 1; k >= 0; k--) w.has(we(s[k])) || s.splice(k, 1);
    for (const k of _) {
      if (!k || !k.stream || n.has(k)) continue;
      const C = k.message ?? "";
      o || !C ? n.set(k, { shown: C.length, done: !0 }) : (n.set(k, { shown: 0, done: !1 }), s.push(k));
    }
    i(0);
  }, { immediate: !0 });
  const l = (_) => {
    const w = e.value[_];
    return w ? n.get(w) : void 0;
  }, c = (_, w) => {
    const k = l(_);
    return k ? w.slice(0, k.shown) : w;
  }, d = (_) => {
    const w = l(_);
    return !!w && !w.done;
  };
  return Vr(() => {
    r && clearTimeout(r);
  }), { displayText: c, isStreaming: d };
}
function Fb(e) {
  const t = te(!0);
  let n = 0;
  const s = () => {
    st({ type: "UNREAD_COUNT", count: n });
  }, r = (o) => {
    var i;
    ((i = o == null ? void 0 : o.data) == null ? void 0 : i.type) === "WIDGET_VISIBILITY" && (t.value = !!o.data.open, t.value && n !== 0 && (n = 0, s()));
  };
  We(() => e.value.length, (o, i) => {
    if (o <= (i ?? 0) || t.value) return;
    const a = e.value[o - 1];
    a && (a.message_type === "bot" || a.message_type === "agent") && (n += 1, s());
  }), oi(() => window.addEventListener("message", r)), Vr(() => window.removeEventListener("message", r));
}
const Bb = { light: !1, mono: !1, radius: 22, bubble: 16, glow: "rgba(157,140,255,.26)", border: "rgba(157,140,255,.32)", card: "linear-gradient(180deg,rgba(28,26,40,.94),rgba(15,14,22,.97))", text: "#ECEAFA", muted: "#9C97BE", agentBg: "rgba(255,255,255,.06)", accent: "#9D8CFF" }, zb = { light: !1, mono: !1, radius: 26, bubble: 18, glow: "rgba(157,140,255,.32)", border: "rgba(157,140,255,.40)", card: "linear-gradient(180deg,#16131F,#0A0910)", text: "#F2F3F8", muted: "#A7A0CC", agentBg: "rgba(255,255,255,.05)", accent: "#9D8CFF" }, Mb = { light: !1, mono: !0, radius: 8, bubble: 4, glow: "rgba(201,242,78,.20)", border: "rgba(201,242,78,.30)", card: "#070907", text: "#D7F7C8", muted: "#7F9B57", agentBg: "rgba(201,242,78,.045)", accent: "#C9F24E" }, Ub = { light: !1, mono: !1, radius: 18, bubble: 14, glow: "rgba(95,227,214,.22)", border: "rgba(95,227,214,.30)", card: "linear-gradient(180deg,#0E1A1A,#0A1414)", text: "#DDF7F3", muted: "#6FAFA8", agentBg: "rgba(255,255,255,.05)", accent: "#5FE3D6" }, jb = { light: !0, mono: !1, radius: 28, bubble: 20, glow: "rgba(255,138,115,.30)", border: "rgba(0,0,0,.07)", card: "#FFFFFF", text: "#2A2730", muted: "#736C7C", agentBg: "#F4F1F6", accent: "#FF8A73" }, $o = { light: !0, mono: !1, radius: 24, bubble: 16, glow: "rgba(255,138,115,.22)", border: "rgba(0,0,0,.08)", card: "#FFFFFF", text: "#2A2A33", muted: "#6E6E7B", agentBg: "#F3F3F6", accent: "#FF8A73" }, qb = { GLASS: Bb, AURORA: zb, TERMINAL: Mb, CALM_MINT: Ub, PLAYFUL: jb, SUNRISE: $o, CHATBOT: $o, ASK_ANYTHING: $o }, Hb = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", jc = "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
function Vb(e) {
  return Math.max(4, Math.round(e * 0.3));
}
function qc(e) {
  const t = (e || "").replace("#", "");
  if (t.length < 6) return "#0B0C10";
  const n = parseInt(t.slice(0, 2), 16), s = parseInt(t.slice(2, 4), 16), r = parseInt(t.slice(4, 6), 16);
  return (0.299 * n + 0.587 * s + 0.114 * r) / 255 > 0.62 ? "#0B0C10" : "#FFFFFF";
}
function Wb(e) {
  return qb[e || ""] || $o;
}
const Kb = "#212529";
function Gb(e, t) {
  const n = Wb(e), s = (t == null ? void 0 : t.chat_background_color) || "", r = /^#[0-9a-fA-F]{6}$/.test(s), o = s || n.card, i = (t == null ? void 0 : t.chat_text_color) || "", a = /^#[0-9a-fA-F]{6}$/.test(i) && i.toLowerCase() !== Kb ? i : r ? sr(s) ? "#FFFFFF" : "#111111" : n.text, l = r ? sr(s) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.62)" : n.muted, c = r ? If(s, 20) : n.agentBg, d = (t == null ? void 0 : t.accent_color) || n.accent, _ = r ? !sr(s) : n.light, w = qc(d) === "#0B0C10", k = _ === w ? l : d, C = n.mono ? Hb : t != null && t.font_family ? `${t.font_family}, ${jc}` : jc;
  return { "--cm-card": o, "--cm-text": a, "--cm-muted": l, "--cm-agent-bg": c, "--cm-accent": d, "--cm-on-accent": qc(d), "--cm-presence": k, "--cm-border": n.border, "--cm-glow": n.glow, "--cm-radius": `${n.radius}px`, "--cm-bubble": `${n.bubble}px`, "--cm-bubble-tail": `${Vb(n.bubble)}px`, "--cm-field-radius": n.mono ? "7px" : "12px", "--cm-avatar-radius": n.mono ? "28%" : "50%", "--cm-hairline": n.light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)", "--cm-body-font": C };
}
const Hc = (e) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: e || "USD" }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};
function Yb() {
  const e = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹", CAD: "CA$", AUD: "A$", CNY: "¥", CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr", NZD: "NZ$", SGD: "S$", HKD: "HK$", KRW: "₩", MXN: "MX$", BRL: "R$", ZAR: "R", RUB: "₽", TRY: "₺", THB: "฿", PLN: "zł", AED: "د.إ", SAR: "﷼", ILS: "₪", MYR: "RM" };
  return { formatCurrency: (t, n) => {
    if (!t && t !== 0) return "";
    const s = n ? e[n] || n : "", r = typeof t == "number" ? t : Number(t), o = Number.isFinite(r) ? r.toLocaleString("en-US", { minimumFractionDigits: Hc(n), maximumFractionDigits: Hc(n) }) : String(t);
    return s ? `${s}${o}` : o;
  }, getCurrencySymbol: (t) => e[t] || t, currencySymbols: e };
}
const Zb = { key: 0, class: "widget-unavailable-overlay" }, Jb = { class: "widget-unavailable-card" }, Qb = { key: 0, class: "widget-unavailable-footer" }, Xb = { key: 1, class: "auth-error-overlay" }, e0 = { class: "auth-error-card" }, t0 = { class: "auth-error-message" }, n0 = { key: 0, class: "initializing-overlay" }, s0 = { key: 0, class: "connecting-message" }, r0 = { key: 1, class: "failed-message" }, o0 = { class: "welcome-content" }, i0 = { class: "welcome-header" }, a0 = ["src", "alt"], l0 = { class: "welcome-title" }, c0 = { class: "welcome-subtitle" }, u0 = { class: "welcome-input-container" }, p0 = { key: 0, class: "email-input" }, d0 = ["disabled"], h0 = { class: "welcome-message-input" }, f0 = ["placeholder", "disabled"], m0 = ["disabled"], g0 = { key: 0, width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, v0 = { key: 1, width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, y0 = { class: "landing-page-content" }, b0 = { class: "landing-page-header" }, _0 = { class: "landing-page-heading" }, w0 = { class: "landing-page-text" }, k0 = { class: "landing-page-actions" }, x0 = { class: "form-fullscreen-content" }, S0 = { key: 0, class: "form-header" }, T0 = { key: 0, class: "form-title" }, A0 = { key: 1, class: "form-description" }, C0 = { class: "form-fields" }, E0 = ["for"], R0 = { key: 0, class: "required-indicator" }, O0 = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "autocomplete", "inputmode"], I0 = ["id", "placeholder", "required", "min", "max", "value", "onInput"], L0 = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput"], N0 = ["id", "required", "value", "onChange"], D0 = { value: "" }, $0 = ["value"], P0 = { key: 4, class: "checkbox-field" }, F0 = ["id", "required", "checked", "onChange"], B0 = { class: "checkbox-label" }, z0 = { key: 5, class: "radio-group" }, M0 = ["name", "value", "required", "checked", "onChange"], U0 = { class: "radio-label" }, j0 = { key: 6, class: "field-error" }, q0 = { class: "form-actions" }, H0 = ["disabled"], V0 = { key: 0, class: "loading-spinner-inline" }, W0 = { key: 1 }, K0 = { class: "header-content" }, G0 = ["src", "alt"], Y0 = { class: "header-info" }, Z0 = { class: "status" }, J0 = { class: "status-text cm-presence" }, Q0 = { class: "header-actions" }, X0 = ["disabled", "title", "aria-label", "aria-expanded"], e_ = { class: "ask-anything-header" }, t_ = ["src", "alt"], n_ = { class: "header-info" }, s_ = { key: 2, class: "loading-history" }, r_ = { class: "cm-email-gate-title" }, o_ = ["disabled"], i_ = { key: 0, class: "cm-email-gate-error" }, a_ = ["disabled"], l_ = { key: 1, class: "cm-welcome-block" }, c_ = { class: "message agent-message cm-welcome-row" }, u_ = ["src", "alt"], p_ = { key: 0, class: "message agent-message cm-welcome-row cm-host-prompt" }, d_ = ["src", "alt"], h_ = { key: 0, class: "cm-msg-avatar", "aria-hidden": "true" }, f_ = ["src"], m_ = ["src"], g_ = { class: "message-col" }, v_ = { key: 0, class: "rating-content" }, y_ = { class: "rating-prompt" }, b_ = ["onMouseover", "onMouseleave", "onClick", "disabled"], __ = { key: 0, class: "feedback-wrapper" }, w_ = { class: "feedback-section" }, k_ = ["onUpdate:modelValue", "disabled"], x_ = { class: "feedback-counter" }, S_ = ["onClick", "disabled"], T_ = { key: 1, class: "submitted-feedback-wrapper" }, A_ = { class: "submitted-feedback" }, C_ = { class: "submitted-feedback-text" }, E_ = { key: 2, class: "submitted-message" }, R_ = { key: 1, class: "form-content" }, O_ = { key: 0, class: "form-header" }, I_ = { key: 0, class: "form-title" }, L_ = { key: 1, class: "form-description" }, N_ = { class: "form-fields" }, D_ = ["for"], $_ = { key: 0, class: "required-indicator" }, P_ = ["id", "type", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "onBlur", "disabled", "autocomplete", "inputmode"], F_ = ["id", "placeholder", "required", "min", "max", "value", "onInput", "disabled"], B_ = ["id", "placeholder", "required", "minlength", "maxlength", "value", "onInput", "disabled"], z_ = ["id", "required", "value", "onChange", "disabled"], M_ = { value: "" }, U_ = ["value"], j_ = { key: 4, class: "checkbox-field" }, q_ = ["id", "checked", "onChange", "disabled"], H_ = ["for"], V_ = { key: 5, class: "radio-field" }, W_ = ["id", "name", "value", "checked", "onChange", "disabled"], K_ = ["for"], G_ = { key: 6, class: "field-error" }, Y_ = { class: "form-actions" }, Z_ = ["onClick", "disabled"], J_ = { key: 2, class: "user-input-content" }, Q_ = { key: 0, class: "user-input-prompt" }, X_ = { key: 1, class: "user-input-form" }, ew = ["onUpdate:modelValue", "onKeydown"], tw = ["onClick", "disabled"], nw = { key: 2, class: "user-input-submitted" }, sw = { key: 0, class: "user-input-confirmation" }, rw = { key: 3, class: "product-message-container" }, ow = ["innerHTML"], iw = { key: 1, class: "products-carousel" }, aw = { class: "carousel-items" }, lw = ["aria-label"], cw = { key: 0, class: "product-image-compact" }, uw = ["src", "alt"], pw = { class: "product-info-compact" }, dw = { class: "product-text-area" }, hw = { class: "product-title-compact" }, fw = { key: 0, class: "product-variant-compact" }, mw = { class: "product-price-compact" }, gw = { class: "product-actions-compact" }, vw = ["onClick"], yw = { key: 2, class: "no-products-message" }, bw = { key: 3, class: "no-products-message" }, _w = ["innerHTML"], ww = ["innerHTML"], kw = { key: 2, class: "message-attachments" }, xw = { key: 0, class: "attachment-image-container" }, Sw = ["src", "alt", "onClick"], Tw = { class: "attachment-image-info" }, Aw = ["href"], Cw = { class: "attachment-size" }, Ew = ["href"], Rw = { class: "attachment-size" }, Ow = { key: 0, class: "citation-chips" }, Iw = ["title"], Lw = { class: "message-info" }, Nw = { key: 0, class: "agent-name" }, Dw = { key: 2, class: "message agent-message cm-welcome-row cm-host-prompt" }, $w = ["src", "alt"], Pw = { key: 5, class: "cm-quick-actions-bar" }, Fw = ["disabled", "onClick"], Bw = { key: 0, class: "file-previews-widget" }, zw = { class: "file-preview-content-widget", style: { cursor: "pointer" } }, Mw = ["src", "alt", "onClick"], Uw = ["onClick"], jw = { class: "file-preview-info-widget" }, qw = { class: "file-preview-name-widget" }, Hw = { class: "file-preview-size-widget" }, Vw = ["onClick"], Ww = { key: 1, class: "upload-progress-widget" }, Kw = { class: "message-input" }, Gw = ["placeholder", "disabled"], Yw = ["disabled", "title"], Zw = ["disabled"], Jw = { key: 2, class: "cm-secret-hint", role: "alert" }, Qw = { key: 7, class: "new-conversation-section" }, Xw = { class: "conversation-ended-message" }, ek = { key: 8, class: "ai-disclaimer" }, tk = { key: 8, class: "rating-dialog" }, nk = { class: "rating-content" }, sk = { class: "star-rating" }, rk = ["onClick"], ok = { class: "rating-actions" }, ik = ["disabled"], ak = { key: 0, class: "preview-modal-image-container" }, lk = ["src", "alt"], ck = { class: "preview-modal-filename" }, uk = { key: 3, class: "widget-loading" }, Vc = 3, pk = "image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls", dk = zn({ __name: "WidgetBuilder", props: { widgetId: {}, token: {}, initialAuthError: {} }, setup(e) {
  const t = e, n = ne(() => {
    var p;
    return t.widgetId || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.widgetId);
  }), { customization: s, agentName: r, applyCustomization: o, initializeFromData: i } = Lb(), { formatCurrency: a } = Yb(), { messages: l, loading: c, errorMessage: d, showError: _, loadingHistory: w, hasStartedChat: k, connectionStatus: C, sendMessage: M, endChat: K, loadChatHistory: x, connect: G, reconnect: Z, cleanup: E, humanAgent: U, onTakeover: T, refusal: J, submitRating: se, submitForm: ie, currentForm: ce, getWorkflowState: Ce, proceedWorkflow: Ke, onWorkflowState: ot, onWorkflowProceeded: Xe, currentSessionId: Ne, setToken: ge, setWidgetId: ye, onSessionState: ft, onReauthorize: Et, on: mt, emit: _t } = cb(), Ge = te(null), { receipts: jn, addReceipt: kn, receiptsAfter: Re } = jv(l), { pendingConfirm: ct, approveAction: an, declineAction: xn, runLocalAction: qn } = _b({ on: mt, emit: _t }, (p) => {
    Ge.value = p;
  }, kn), { journeyProgress: Xt, chipBusy: g, runChip: y, skipStep: I, dismissJourney: B, noteActivity: L } = xb({ on: mt, emit: _t, currentPrompt: () => Ge.value, showPrompt: (p) => {
    Ge.value = p;
  }, addNotice: (p) => {
    l.value.push({ message: p, message_type: "bot", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } });
  }, runLocalAction: qn }), $ = (p) => {
    p.kind === "action" && !g.value && !ct.value && (j.value && ee(j.value), l.value.push({ message: p.label, message_type: "user", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: "journey" } })), y(p, Yn);
  }, F = ne(() => {
    const p = Ge.value;
    return !(p != null && p.chips.length) || ct.value || c.value ? [] : p.chips;
  }), j = ne(() => {
    const p = Ge.value;
    return !p || p.source !== "journey" ? p : l.value.some((f) => f.message_type === "bot" && f.message === p.message) ? null : p;
  }), z = ne(() => c.value ? null : j.value), P = Sb(l, z), ee = (p) => {
    l.value.splice(P.index(), 0, { message: p.message, message_type: "bot", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: "", attributes: { source: p.source } });
  }, { displayText: H, isStreaming: re } = Pb(l, () => os(() => pn()));
  Fb(l);
  const X = te(""), he = te(!0), D = te(""), R = te(!1), Q = (p) => {
    const f = p.target;
    X.value = f.value;
  };
  let le = null;
  const xe = () => {
    le && le.disconnect(), le = new MutationObserver((f) => {
      let W = !1, h = !1;
      f.forEach((ae) => {
        if (ae.type === "childList") {
          const Oe = Array.from(ae.addedNodes).some((Me) => {
            var Pe;
            return Me.nodeType === Node.ELEMENT_NODE && (Me.matches("input, textarea") || ((Pe = Me.querySelector) == null ? void 0 : Pe.call(Me, "input, textarea")));
          }), ue = Array.from(ae.removedNodes).some((Me) => {
            var Pe;
            return Me.nodeType === Node.ELEMENT_NODE && (Me.matches("input, textarea") || ((Pe = Me.querySelector) == null ? void 0 : Pe.call(Me, "input, textarea")));
          });
          Oe && (h = !0, W = !0), ue && (W = !0);
        }
      }), W && (clearTimeout(xe.timeoutId), xe.timeoutId = setTimeout(() => {
        Ut();
      }, h ? 50 : 100));
    });
    const p = document.querySelector(".widget-container") || document.body;
    le.observe(p, { childList: !0, subtree: !0 });
  };
  xe.timeoutId = null;
  let Te = [];
  const et = /* @__PURE__ */ new Set();
  let tt = !1;
  const De = (p) => {
    if (tt) return;
    const f = setTimeout(() => {
      et.delete(f), Ut();
    }, p);
    et.add(f);
  }, Ye = () => {
    et.forEach(clearTimeout), et.clear();
  }, Ut = () => {
    ln();
    const p = ['.widget-container input[type="text"]', '.chat-container input[type="text"]', ".message-input input", ".welcome-message-field", ".ask-anything-field", 'input[placeholder*="message"]', 'input[placeholder*="Type"]', 'input[placeholder*="Ask"]', "input.message-input", "textarea", ".widget-container input", ".chat-input input", "input"];
    let f = [];
    for (const W of p) {
      const h = document.querySelectorAll(W);
      if (h.length > 0) {
        f = Array.from(h);
        break;
      }
    }
    f.length !== 0 && (Te = f, f.forEach((W) => {
      W.addEventListener("input", Sn, !0), W.addEventListener("keyup", Sn, !0), W.addEventListener("change", Sn, !0), W.addEventListener("keypress", Ps, !0), W.addEventListener("keydown", Fs, !0);
    }));
  }, ln = () => {
    Te.forEach((p) => {
      p.removeEventListener("input", Sn), p.removeEventListener("keyup", Sn), p.removeEventListener("change", Sn), p.removeEventListener("keypress", Ps), p.removeEventListener("keydown", Fs);
    }), Te = [];
  }, en = (p) => !!(p && p.closest && p.closest(".form-message, .form-fullscreen, .cm-email-gate")), Sn = (p) => {
    if (en(p.target)) return;
    const f = p.target;
    X.value = f.value;
  }, Ps = (p) => {
    en(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), qt());
  }, Fs = (p) => {
    en(p.target) || p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), qt());
  }, Tn = (p) => {
    const f = p.target, W = document.querySelector(".header-menu-container");
    document.querySelector(".header-menu-btn");
    const h = document.querySelector(".header-dropdown-menu");
    h && !(W != null && W.contains(f)) && (h.style.display = "none");
  }, tn = te(!0), { token: wt, start: Gr, stop: Yr, setToken: Hn, ensureFresh: Zr } = iy({ onTokenChanged: (p) => {
    Is() && st({ type: "TOKEN_UPDATE", token: p }), ge(p);
  }, onIdentityExpired: () => {
    sl();
  }, onTokenCleared: () => {
    Jo() && Is() && st({ type: "TOKEN_CLEAR" });
  }, store: Sp(n.value || "") });
  ne(() => !!wt.value);
  const Rt = te(null), kt = te(!1), Lt = te(!1);
  t.initialAuthError && (Rt.value = t.initialAuthError, kt.value = !0, tn.value = !1), i();
  const ut = window.__INITIAL_DATA__;
  Gr((ut == null ? void 0 : ut.widgetId) || "", ut == null ? void 0 : ut.initialToken), wt.value && (R.value = !0);
  const Vn = te(!1);
  (ut == null ? void 0 : ut.allowAttachments) !== void 0 && (Vn.value = ut.allowAttachments);
  const Wn = te(null), { chatStyles: fs, chatIconStyles: Jr, agentBubbleStyles: An, userBubbleStyles: nn, messageNameStyles: Nt, headerBorderStyles: Qr, photoUrl: qe, shadowStyle: fi } = py(s), Xr = te(null), { uploadedAttachments: Ae, previewModal: Kn, previewFile: ms, formatFileSize: Bs, isImageAttachment: ar, getDownloadUrl: gs, getPreviewUrl: lr, handleFileSelect: eo, handleDrop: to, handleDragOver: no, handleDragLeave: so, handlePaste: cn, removeAttachment: ro, openPreview: Gn, closePreview: jt, openFilePicker: oo, isImage: vs } = fy(wt, Xr);
  ne(() => l.value.some((p) => p.message_type === "form" && (!p.isSubmitted || p.isSubmitted === !1)));
  const un = ne(() => {
    var p;
    return k.value && R.value || !wi.value ? C.value === "connected" && !c.value : vr(D.value.trim()) && C.value === "connected" && !c.value || ((p = window.__INITIAL_DATA__) == null ? void 0 : p.workflow);
  }), ys = ne(() => un.value || c.value && C.value === "connected" && k.value), zs = ne(() => C.value === "connected" ? Kt.value ? "Ask me anything..." : "Type a message..." : "Connecting..."), Ms = te(!1), Cn = ne(() => Gv(X.value)), qt = async () => {
    var h;
    if (!X.value.trim() && Ae.value.length === 0 || Cn.value) return;
    if (c.value && k.value) {
      Ms.value = !0;
      return;
    }
    !k.value && D.value && await it();
    const p = Ae.value.map((ae) => ({ content: ae.content, filename: ae.filename, content_type: ae.type, size: ae.size }));
    L();
    const f = j.value;
    f && ee(f), ((h = Ge.value) == null ? void 0 : h.source) !== "journey" && (Ge.value = null), await M(X.value, D.value, p, f ? { host_prompt: f.message, host_prompt_source: f.source } : {}), Ae.value.forEach((ae) => {
      ae.url && ae.url.startsWith("blob:") && URL.revokeObjectURL(ae.url), ae.file_url && ae.file_url.startsWith("blob:") && URL.revokeObjectURL(ae.file_url);
    }), X.value = "", Ae.value = [];
    const W = document.querySelector('input[placeholder*="Type a message"]');
    W && (W.value = ""), De(500);
  };
  We(c, (p) => {
    p || !Ms.value || (Ms.value = !1, C.value === "connected" && k.value && qt());
  });
  const Yn = (p) => {
    un.value && (X.value = p, qt());
  }, sn = () => {
    st({ type: "WIDGET_MINIMIZE" });
  }, Zn = (p) => {
    p.key === "Enter" && !p.shiftKey && (p.preventDefault(), p.stopPropagation(), qt());
  }, it = async ({ afterRefusal: p = !1 } = {}) => {
    var f, W, h, ae;
    try {
      if (!n.value) return console.error("Widget ID is not available"), Rt.value = "Widget ID is not available. Please refresh and try again.", kt.value = !0, !1;
      await Zr(n.value);
      const Oe = new URL(`${Ds.API_URL}/widgets/${n.value}`);
      D.value.trim() && vr(D.value.trim()) && Oe.searchParams.append("email", D.value.trim());
      const ue = { Accept: "application/json", "Content-Type": "application/json" };
      wt.value && (ue.Authorization = `Bearer ${wt.value}`);
      const Me = Nb(wt.value, Oe.searchParams.get("email")) ?? await fetch(Oe, { headers: ue, cache: "no-store" });
      if (Me.status === 401) {
        R.value = !1;
        try {
          const hn = (await Me.json()).detail;
          if ((hn == null ? void 0 : hn.code) === ty) return sl(), !1;
          const Ws = typeof hn == "string" ? hn : "";
          (Ws.includes("generate-token") || Ws.includes("API key") || Ws.includes("Token required")) && (Lt.value = !0, Rt.value = "Widget authentication not configured. Please contact the website administrator.", kt.value = !0, Hn(null));
        } catch {
          Rt.value = "Authentication required. Your token has expired or is invalid. Please refresh the page.", kt.value = !0, Hn(null);
        }
        return !1;
      }
      if (!Me.ok) {
        try {
          const hn = await Me.json();
          Rt.value = hn.detail || `Error: ${Me.statusText}`;
        } catch {
          Rt.value = `Error: ${Me.statusText}. Please try again.`;
        }
        return kt.value = !0, !1;
      }
      const Pe = await Me.json();
      Pe.token && Hn(Pe.token), R.value = !0, Rt.value = null, kt.value = !1, ge(wt.value || void 0);
      const dr = await G();
      return !dr && la(J.value) && !p ? await it({ afterRefusal: !0 }) : (dr || console.error("Chat service not reachable yet; retrying in the background"), await mi(), (f = Pe.agent) != null && f.customization && o(Pe.agent.customization), Pe.agent && !(Pe != null && Pe.human_agent) && (r.value = Pe.agent.name), Pe != null && Pe.human_agent && (U.value = Pe.human_agent), ((W = Pe.agent) == null ? void 0 : W.allow_attachments) !== void 0 && (Vn.value = Pe.agent.allow_attachments), ((h = Pe.agent) == null ? void 0 : h.workflow) !== void 0 && (window.__INITIAL_DATA__ = window.__INITIAL_DATA__ || {}, window.__INITIAL_DATA__.workflow = Pe.agent.workflow), (ae = Pe.agent) != null && ae.workflow && await Ce(), !0);
    } catch (Oe) {
      return console.error("Error checking authorization:", Oe), Rt.value = "An unexpected error occurred. Please try again.", kt.value = !0, R.value = !1, !1;
    } finally {
      tn.value = !1;
    }
  }, mi = async () => {
    !k.value && R.value && (k.value = !0, await x());
  }, pn = () => {
    Wn.value && (Wn.value.scrollTop = Wn.value.scrollHeight);
  };
  We(() => l.value, (p) => {
    os(() => {
      pn();
    });
  }, { deep: !0 }), We([ct, z, () => jn.value.length, c], ([p, f, W, h]) => {
    (p || f || W || h) && os(() => pn());
  }), We(C, (p, f) => {
    p === "connected" && f !== "connected" && De(100);
  }), We(() => l.value.length, (p, f) => {
    p > 0 && f === 0 && De(100);
  });
  let io = null;
  We(() => l.value, (p) => {
    const f = p[p.length - 1];
    !Oc(f) || f === io || (io = f, de(f));
  }, { deep: !0 });
  const ao = async () => {
    (await Z() || la(J.value)) && await it();
  }, cr = te(!1), bs = te(0), Us = te(""), Ht = te(0), Dt = te(!1), He = te({}), nt = te(!1), je = te({}), Vt = te(!1), En = te(null), u = te("Start Chat"), A = te(!1), O = te(null);
  ne(() => {
    var p, f;
    return ((f = (p = l.value[l.value.length - 1]) == null ? void 0 : p.attributes) == null ? void 0 : f.request_rating) || !1;
  });
  const V = ne(() => {
    var p, f;
    return (p = window.__INITIAL_DATA__) != null && p.workflow ? ((f = l.value.find((W) => W.message_type === "rating")) == null ? void 0 : f.isSubmitted) === !0 : !1;
  }), oe = ne(() => Yo(U.value.human_agent_profile_pic)), de = async (p) => {
    var f, W, h, ae, Oe;
    if (Oc(p)) {
      try {
        if (p.session_id && wt.value && n.value) {
          const ue = await nl(p.session_id, { reason: (f = p.attributes) == null ? void 0 : f.end_chat_reason, description: (W = p.attributes) == null ? void 0 : W.end_chat_description });
          if (ue.ok) {
            const Me = await ue.json();
            console.info(`✓ Chat session closed on backend: ${Me.session_id}`);
          } else console.warn(`Failed to close session on backend: ${ue.status}`);
        }
      } catch (ue) {
        console.error("Error calling end-chat API:", ue);
      }
      if ((h = p.attributes) != null && h.end_chat && ((ae = p.attributes) != null && ae.request_rating)) {
        const ue = p.agent_name || ((Oe = U.value) == null ? void 0 : Oe.human_agent_name) || r.value || "our agent";
        l.value.push({ message: `Rate the chat session that you had with ${ue}`, message_type: "rating", created_at: (/* @__PURE__ */ new Date()).toISOString(), session_id: p.session_id, agent_name: ue, showFeedback: !1 }), Ne.value = p.session_id;
      }
    }
  }, be = (p) => {
    Dt.value || (Ht.value = p);
  }, Wt = () => {
    if (!Dt.value) {
      const p = l.value[l.value.length - 1];
      Ht.value = (p == null ? void 0 : p.selectedRating) || 0;
    }
  }, dn = async (p) => {
    if (!Dt.value) {
      Ht.value = p;
      const f = l.value[l.value.length - 1];
      f && f.message_type === "rating" && (f.showFeedback = !0, f.selectedRating = p);
    }
  }, at = async (p, f, W = null) => {
    try {
      Dt.value = !0, await se(f, W);
      const h = l.value.find((ae) => ae.message_type === "rating");
      h && (h.isSubmitted = !0, h.finalRating = f, h.finalFeedback = W);
    } catch (h) {
      console.error("Failed to submit rating:", h);
    } finally {
      Dt.value = !1;
    }
  }, $t = (p) => {
    const f = {};
    for (const W of p.fields) {
      const h = He.value[W.name], ae = gi(W, h);
      ae && (f[W.name] = ae);
    }
    return je.value = f, Object.keys(f).length === 0;
  }, pt = async (p) => {
    if (!(nt.value || !$t(p))) try {
      nt.value = !0, await ie(He.value);
      const f = l.value.findIndex((W) => W.message_type === "form" && (!W.isSubmitted || W.isSubmitted === !1));
      f !== -1 && l.value.splice(f, 1), He.value = {}, je.value = {};
    } catch (f) {
      console.error("Failed to submit form:", f);
    } finally {
      nt.value = !1;
    }
  }, dt = (p, f) => {
    var W, h;
    if (He.value[p] = f, f && f.toString().trim() !== "") {
      let ae = null;
      if ((W = O.value) != null && W.fields && (ae = O.value.fields.find((Oe) => Oe.name === p)), !ae && ((h = ce.value) != null && h.fields) && (ae = ce.value.fields.find((Oe) => Oe.name === p)), ae) {
        const Oe = gi(ae, f);
        Oe ? (je.value[p] = Oe, console.log(`Validation error for ${p}:`, Oe)) : delete je.value[p];
      }
    } else delete je.value[p], console.log(`Cleared error for ${p}`);
  }, Bp = (p) => {
    const f = p.replace(/\D/g, "");
    return f.length >= 7 && f.length <= 15;
  }, gi = (p, f) => {
    if (p.required && (!f || f.toString().trim() === "")) return `${p.label} is required`;
    if (!f || f.toString().trim() === "") return null;
    if (p.type === "email" && !vr(f)) return "Please enter a valid email address";
    if (p.type === "tel" && !Bp(f)) return "Please enter a valid phone number";
    if ((p.type === "text" || p.type === "textarea") && p.minLength && f.length < p.minLength) return `${p.label} must be at least ${p.minLength} characters`;
    if ((p.type === "text" || p.type === "textarea") && p.maxLength && f.length > p.maxLength) return `${p.label} must not exceed ${p.maxLength} characters`;
    if (p.type === "number") {
      const W = parseFloat(f);
      if (isNaN(W)) return `${p.label} must be a valid number`;
      if (p.minLength && W < p.minLength) return `${p.label} must be at least ${p.minLength}`;
      if (p.maxLength && W > p.maxLength) return `${p.label} must not exceed ${p.maxLength}`;
    }
    return null;
  }, zp = async () => {
    if (!(nt.value || !O.value)) try {
      nt.value = !0, je.value = {};
      let p = !1;
      for (const f of O.value.fields || []) {
        const W = He.value[f.name], h = gi(f, W);
        h && (je.value[f.name] = h, p = !0, console.log(`Validation error for field ${f.name}:`, h));
      }
      if (p) {
        nt.value = !1, console.log("Validation failed, not submitting");
        return;
      }
      await ie(He.value), A.value = !1, O.value = null, He.value = {};
    } catch (p) {
      console.error("Failed to submit full screen form:", p);
    } finally {
      nt.value = !1, console.log("Full screen form submission completed");
    }
  }, Mp = (p, f) => {
    if (console.log("handleViewDetails called with:", { product: p, shopDomain: f }), !p) {
      console.error("No product provided to handleViewDetails");
      return;
    }
    let W = null;
    if (p.handle && f) W = `https://${f}/products/${p.handle}`;
    else if (p.id && f) W = `https://${f}/products/${p.id}`;
    else if (f) {
      if (!p.handle && !p.id) {
        console.error("Product handle and ID are both missing! Product:", p), alert("Unable to open product: Product information incomplete.");
        return;
      }
    } else {
      console.error("Shop domain is missing! Product:", p), alert("Unable to open product: Shop domain not available. Please contact support.");
      return;
    }
    W && (console.log("Opening product URL:", W), window.open(W, "_blank", "noopener"));
  }, Up = (p) => {
    if (!p) return "";
    let f = p.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
    const W = [];
    return f = f.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (h, ae, Oe) => {
      const ue = `__MARKDOWN_LINK_${W.length}__`;
      return console.log("Found markdown link:", h, "-> placeholder:", ue), W.push(h), ue;
    }), console.log("After replacing markdown links with placeholders:", f), console.log("Markdown links array:", W), f = f.replace(/https?:\/\/[^\s\)]+/g, "[link removed]"), console.log("After removing standalone URLs:", f), W.forEach((h, ae) => {
      f = f.replace(`__MARKDOWN_LINK_${ae}__`, h), console.log(`Restored markdown link ${ae}:`, h);
    }), f = f.replace(/\n\s*\n\s*\n/g, `

`).trim(), f;
  }, el = te(!1);
  te(!1);
  const vi = ne(() => {
    var p;
    return !!((p = U.value) != null && p.human_agent_name);
  }), tl = ne(() => {
    var p;
    return Xv((p = window.__INITIAL_DATA__) == null ? void 0 : p.presence, vi.value);
  }), js = ne(() => {
    var p;
    return !((p = window.__INITIAL_DATA__) != null && p.hideBranding);
  }), jp = ne(() => Vn.value && vi.value && Ae.value.length < Vc), qp = async () => {
    try {
      Vt.value = !1, En.value = null, await Ke();
    } catch (p) {
      console.error("Failed to proceed workflow:", p);
    }
  }, yi = async (p) => {
    try {
      if (!p.userInputValue || !p.userInputValue.trim()) return;
      const f = p.userInputValue.trim();
      p.isSubmitted = !0, p.submittedValue = f, await M(f, D.value);
    } catch (f) {
      console.error("Failed to submit user input:", f), p.isSubmitted = !1, p.submittedValue = null;
    }
  }, nl = (p, { reason: f, description: W, keepalive: h = !1 } = {}) => {
    const ae = new URL(`${Ds.API_URL}/widgets/${n.value}/end-chat`);
    return ae.searchParams.append("session_id", p), f && ae.searchParams.append("reason", f), W && ae.searchParams.append("description", W), fetch(ae, { method: "POST", keepalive: h, headers: { Authorization: `Bearer ${wt.value}`, "Content-Type": "application/json" } });
  }, Hp = async (p) => {
    try {
      typeof p == "string" && p && wt.value && n.value && await nl(p, { reason: "CUSTOMER_REQUEST", keepalive: !0 });
    } catch {
    } finally {
      st({ type: "END_CHAT_DONE" });
    }
  }, sl = () => {
    if (!Is()) {
      rl();
      return;
    }
    st({ type: "IDENTITY_EXPIRED" });
  }, rl = async () => {
    wt.value && (Hn(null), await ur());
  }, Vp = async (p) => {
    const f = as(p);
    !f || f === wt.value || (Hn(f), await ur());
  }, ur = async () => {
    var p, f, W;
    try {
      let h = 0;
      const ae = 50;
      for (; !((p = window.__INITIAL_DATA__) != null && p.widgetId) && h < ae; ) await new Promise((Oe) => setTimeout(Oe, 100)), h++;
      return (f = window.__INITIAL_DATA__) != null && f.widgetId ? (ye(window.__INITIAL_DATA__.widgetId), await it() ? ((W = window.__INITIAL_DATA__) != null && W.workflow && R.value && await Ce(), !0) : (C.value = "connected", !1)) : (console.error("Widget data not available after waiting"), !1);
    } catch (h) {
      return console.error("Failed to initialize widget:", h), !1;
    }
  };
  window.addEventListener("message", (p) => {
    p.source === window.parent && (!p.data || typeof p.data.type != "string" || $v(p.data) || (p.data.type === "SCROLL_TO_BOTTOM" && pn(), p.data.type === "HOST_PAGE" && xp(p.data.url), p.data.type === "END_CHAT" && Is() && Hp(p.data.sessionId), p.data.type === "IDENTITY_UNAVAILABLE" && Is() && rl(), p.data.type === "TOKEN_REFRESH" && Is() && Vp(p.data.token), p.data.type === "WIDGET_VISIBILITY" && (ml.value = !!p.data.open), p.data.type === "WIDGET_DISPLAY" && (ki.value = { mode: p.data.mode, width: p.data.width, height: p.data.height, hotkey: p.data.hotkey }), p.data.type === "PREFILL_MESSAGE" && typeof p.data.text == "string" && (X.value = p.data.text.slice(0, 2e3), os(() => {
      var f;
      (f = document.querySelector(".message-input input, .welcome-message-field")) == null || f.focus();
    }))));
  }), window.addEventListener("keydown", (p) => {
    p.key !== "Escape" || p.defaultPrevented || !Jo() || st({ type: "WIDGET_ESCAPE" });
  });
  const Wp = () => {
    T(async () => {
      await it();
    }), Et(async () => {
      await it();
    }), ft(({ session_id: p, authenticated: f, created: W }) => {
      st({ type: "CHAT_SESSION", sessionId: p, authenticated: f, created: W });
    }), ot((p) => {
      var f;
      if (u.value = p.button_text || "Start Chat", p.type === "landing_page") En.value = p.landing_page_data, Vt.value = !0, A.value = !1;
      else if (p.type === "form" || p.type === "display_form") if (((f = p.form_data) == null ? void 0 : f.form_full_screen) === !0) O.value = p.form_data, A.value = !0, Vt.value = !1;
      else {
        const W = { message: "", message_type: "form", attributes: { form_data: p.form_data }, created_at: (/* @__PURE__ */ new Date()).toISOString(), isSubmitted: !1 };
        l.value.findIndex((h) => h.message_type === "form" && !h.isSubmitted) === -1 && l.value.push(W), Vt.value = !1, A.value = !1;
      }
      else Vt.value = !1, A.value = !1;
    }), Xe((p) => {
      console.log("Workflow proceeded:", p);
    });
  }, Kp = async () => {
    try {
      await ur(), await Ce();
    } catch (p) {
      throw console.error("Failed to start new conversation:", p), p;
    }
  }, lo = ne(() => {
    var p;
    return s.value.allow_new_chat === !0 && l.value.length > 0 && !((p = U.value) != null && p.human_agent_name) && !ks.value;
  }), Jn = te(!1), Qn = te(""), Xn = te(!1);
  let _s = null;
  const qs = () => {
    Xn.value = !1, Qn.value = "", _s && (clearTimeout(_s), _s = null);
  }, ol = () => {
    if (!Jn.value) {
      if (Xn.value) {
        qs();
        return;
      }
      Xn.value = !0, Qn.value = "", _s = setTimeout(qs, eg);
    }
  };
  We(lo, (p) => {
    p || qs();
  });
  const il = async () => {
    Jn.value || (_s && (clearTimeout(_s), _s = null), await Gp(), Qn.value || (Xn.value = !1));
  }, Gp = async () => {
    if (!Jn.value) {
      Jn.value = !0, Qn.value = "";
      try {
        if (!await K()) {
          Qn.value = Ec;
          return;
        }
        U.value = {}, X.value = "", Ae.value = [], await ur();
      } catch (p) {
        console.error("Failed to start a new chat:", p), Qn.value = Ec;
      } finally {
        Jn.value = !1;
      }
    }
  }, Yp = async () => {
    V.value = !1, l.value = [], U.value = {}, await Kp();
  };
  oi(async () => {
    await ur(), Wp(), xe(), document.addEventListener("click", Tn), (() => {
      const p = l.value.length > 0, f = C.value === "connected", W = document.querySelector('input[type="text"], textarea') !== null;
      return p || f || W;
    })() && De(100);
  }), Vr(() => {
    window.removeEventListener("message", (p) => {
      p.data.type === "SCROLL_TO_BOTTOM" && pn();
    }), document.removeEventListener("click", Tn), le && (le.disconnect(), le = null), xe.timeoutId && (clearTimeout(xe.timeoutId), xe.timeoutId = null), tt = !0, Ye(), ln(), Yr(), qs(), E();
  });
  const Hs = ne(() => s.value.chat_style === "AURORA"), Kt = ne(() => s.value.chat_style === "ASK_ANYTHING" || Hs.value), al = ne(() => s.value.customization_metadata), Vs = ne(() => {
    var f;
    const p = (f = al.value) == null ? void 0 : f.avatar_style;
    return p === "orb" ? !0 : p === "photo" ? !1 : Hs.value && !s.value.photo_url;
  }), ws = ne(() => {
    var p;
    return Jv(r.value || "", (p = al.value) == null ? void 0 : p.orb_variant);
  }), Zp = { GLASS: "theme-glass", TERMINAL: "theme-terminal", PLAYFUL: "theme-playful", CALM_MINT: "theme-calm", SUNRISE: "theme-sunrise" }, Jp = ne(() => Zp[s.value.chat_style] || ""), Qp = ne(() => Gb(s.value.chat_style, { chat_background_color: s.value.chat_background_color, chat_text_color: s.value.chat_text_color, accent_color: s.value.accent_color, font_family: s.value.font_family })), bi = ne(() => Array.isArray(s.value.quick_actions) ? s.value.quick_actions.filter((p) => !!p && p.trim().length > 0) : []), ll = ne(() => (s.value.welcome_message || "").trim()), cl = ne(() => !Kt.value && l.value.length === 0 && !w.value && !ks.value), Xp = ne(() => cl.value && ll.value.length > 0), ed = ne(() => cl.value && !V.value && bi.value.length > 0), co = ne(() => s.value.show_citations === !0), ul = ne(() => Qv(s.value.show_ai_disclaimer, vi.value)), td = (p) => /^[0-9a-f]{16,}$/i.test(p) || /^[0-9a-f-]{32,}$/i.test(p), pl = (p) => {
    const f = (p || "").trim().toLowerCase();
    return !f || f === "unknown" ? "Knowledge base" : f.charAt(0).toUpperCase() + f.slice(1);
  }, _i = (p) => {
    let f = ((p == null ? void 0 : p.name) || "").trim();
    return !f || (f = f.replace(/^[0-9a-f]{16,}[_-]/i, "").replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, ""), !f || td(f)) ? pl(p == null ? void 0 : p.type) : f;
  }, dl = (p) => {
    const f = _i(p), W = pl(p == null ? void 0 : p.type);
    return f === W ? W : `${f} · ${W}`;
  }, wi = ne(() => s.value.collect_email === !0 && !Kt.value), hl = te(!1), es = te(""), pr = te(!1), ks = ne(() => !k.value && wi.value && !hl.value), fl = async () => {
    const p = D.value.trim();
    if (!p) {
      es.value = "Please enter your email address.";
      return;
    }
    if (!vr(p)) {
      es.value = "Please enter a valid email address.";
      return;
    }
    es.value = "", pr.value = !0;
    try {
      await it(), hl.value = !0;
    } catch {
      es.value = "Something went wrong. Please try again.";
    } finally {
      pr.value = !1;
    }
  }, ki = te(null), ml = te(!0), xi = { mode: "floating", width: 400, height: 560 }, uo = ne(() => {
    var p;
    return ki.value || ((p = s.value.customization_metadata) == null ? void 0 : p.widget_display) || null;
  }), nd = ne(() => {
    const p = uo.value;
    return p ? typeof p.mode == "string" && p.mode !== xi.mode || typeof p.width == "number" && p.width !== xi.width || typeof p.height == "number" && p.height !== xi.height : !1;
  }), sd = ne(() => {
    var f;
    const p = { width: "100%", height: "100%", borderRadius: "var(--radius-lg)" };
    if (nd.value) {
      const W = (f = uo.value) == null ? void 0 : f.mode;
      return W === "sidebar-left" || W === "sidebar-right" ? { ...p, borderRadius: "0" } : p;
    }
    return Kt.value ? window.innerWidth <= 768 ? { ...p, width: "100vw", height: "100vh", maxWidth: "100vw", maxHeight: "100vh", minWidth: "unset", borderRadius: "0" } : window.innerWidth <= 1024 ? { ...p, width: "95%", maxWidth: "700px", minWidth: "500px", height: "650px" } : { ...p, width: "100%", maxWidth: "400px", minWidth: "400px", height: "580px" } : p;
  }), gl = ne(() => Kt.value && l.value.length === 0), rd = ["form", "user_input", "rating", "product", "shopify_output"], od = ne(() => l.value.some((p) => rd.includes(p.message_type) || Array.isArray(p.attachments) && p.attachments.length > 0)), id = ne(() => {
    var p, f;
    return Kt.value ? !0 : (((p = uo.value) == null ? void 0 : p.mode) === "ask-ai" || ((f = uo.value) == null ? void 0 : f.mode) === "search-bar") && !Vn.value;
  }), Si = ne(() => id.value && he.value && !Vt.value && !A.value && !ks.value && !V.value && !od.value);
  We(Si, (p) => {
    st({ type: "WIDGET_SURFACE", palette: p });
  }, { immediate: !0 });
  const ad = ne(() => s.value.welcome_subtitle || `Ask a question — ${r.value || "the assistant"} answers from what it knows.`), ld = ne(() => {
    var p;
    return ((p = ki.value) == null ? void 0 : p.hotkey) !== !1;
  });
  return (p, f) => {
    var W;
    return kt.value && Lt.value ? (v(), b("div", Zb, [m("button", { type: "button", class: "cm-error-close", "aria-label": "Close chat", title: "Close", onClick: sn }, "×"), m("div", Jb, [f[21] || (f[21] = Ni('<div class="widget-unavailable-icon-wrapper" data-v-4e56e45f><svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-4e56e45f><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-4e56e45f></path><path d="M9 12l2 2 4-4" data-v-4e56e45f></path></svg></div><h2 class="widget-unavailable-title" data-v-4e56e45f>Chat Unavailable</h2><p class="widget-unavailable-message" data-v-4e56e45f> This chat widget is not currently configured. Please contact the website administrator to enable chat support. </p>', 3)), js.value ? (v(), b("div", Qb, [Tt(xr, { class: "chattermate-logo-small", size: 14 }), f[20] || (f[20] = m("a", { class: "cm-powered-link", href: "https://chattermate.chat", target: "_blank", rel: "noopener" }, [m("span", { class: "cm-powered-prefix" }, "Powered by "), m("strong", { class: "cm-brand" }, "ChatterMate")], -1))])) : Y("", !0)])])) : kt.value ? (v(), b("div", Xb, [m("button", { type: "button", class: "cm-error-close", "aria-label": "Close chat", title: "Close", onClick: sn }, "×"), m("div", e0, [f[22] || (f[22] = Ni('<div class="auth-error-header" data-v-4e56e45f><svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-4e56e45f><circle cx="12" cy="12" r="10" data-v-4e56e45f></circle><line x1="12" y1="8" x2="12" y2="12" data-v-4e56e45f></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-4e56e45f></line></svg><h2 data-v-4e56e45f>Authentication Error</h2></div>', 1)), m("p", t0, q(Rt.value), 1), m("button", { class: "auth-error-refresh-btn", onClick: f[0] || (f[0] = () => p.window.location.reload()) }, " Refresh Page ")])])) : n.value && !kt.value ? (v(), b("div", { key: 2, class: _e(["chat-container cm-surface", [{ collapsed: !he.value, "ask-anything-style": Kt.value, aurora: Hs.value }, Jp.value]]), style: fe({ ...S(fi), ...sd.value, ...Qp.value }) }, [tn.value ? (v(), b("div", n0, f[23] || (f[23] = [Ni('<div class="loading-spinner" data-v-4e56e45f><div class="dot" data-v-4e56e45f></div><div class="dot" data-v-4e56e45f></div><div class="dot" data-v-4e56e45f></div></div><div class="loading-text" data-v-4e56e45f>Initializing chat...</div>', 2)]))) : Y("", !0), !tn.value && S(C) !== "connected" ? (v(), b("div", { key: 1, class: _e(["connection-status", S(C)]) }, [S(C) === "connecting" ? (v(), b("div", s0, f[24] || (f[24] = [On(" Connecting to chat service... ", -1), m("div", { class: "loading-dots" }, [m("div", { class: "dot" }), m("div", { class: "dot" }), m("div", { class: "dot" })], -1)]))) : S(C) === "failed" ? (v(), b("div", r0, [f[25] || (f[25] = On(" Connection failed. ", -1)), m("button", { onClick: ao, class: "reconnect-button" }, " Click here to reconnect ")])) : Y("", !0)], 2)) : Y("", !0), S(_) ? (v(), b("div", { key: 2, class: "error-alert", style: fe(S(Jr)) }, q(S(d)), 5)) : Y("", !0), Si.value ? (v(), In(Eg, { key: 3, messages: S(l), draft: X.value, "agent-name": S(r), suggestions: bi.value, "welcome-title": S(s).welcome_title, "welcome-subtitle": ad.value, placeholder: zs.value, "input-enabled": un.value, "typing-enabled": ys.value, loading: S(c), "show-citations": co.value, disclaimer: ul.value ? S(Ic) : "", "show-branding": js.value, active: ml.value, hotkey: ld.value, "can-start-new-chat": lo.value, "starting-new-chat": Jn.value, "new-chat-armed": Xn.value, "new-chat-error": Qn.value, onNewChat: ol, onConfirmNewChat: il, onCancelNewChat: qs, "citation-label": _i, "citation-tooltip": dl, "display-text": S(H), "is-streaming": S(re), "onUpdate:draft": f[1] || (f[1] = (h) => X.value = h), onSend: qt, onAsk: Yn, onClose: sn }, null, 8, ["messages", "draft", "agent-name", "suggestions", "welcome-title", "welcome-subtitle", "placeholder", "input-enabled", "typing-enabled", "loading", "show-citations", "disclaimer", "show-branding", "active", "hotkey", "can-start-new-chat", "starting-new-chat", "new-chat-armed", "new-chat-error", "display-text", "is-streaming"])) : gl.value ? (v(), b("div", { key: 4, class: _e(["welcome-message-section", { aurora: Hs.value }]), style: fe(S(fs)) }, [m("div", o0, [m("div", i0, [Vs.value ? (v(), b("div", { key: 0, class: "welcome-orb", style: fe(ws.value) }, null, 4)) : S(qe) ? (v(), b("img", { key: 1, src: S(qe), alt: S(r), class: "welcome-avatar" }, null, 8, a0)) : Y("", !0), m("h1", l0, q(S(s).welcome_title || `Welcome to ${S(r)}`), 1), m("p", c0, q(S(s).welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?"), 1)])]), m("div", u0, [!S(k) && !R.value && wi.value ? (v(), b("div", p0, [ts(m("input", { "onUpdate:modelValue": f[2] || (f[2] = (h) => D.value = h), type: "email", placeholder: "Enter your email address", disabled: S(c) || S(C) !== "connected", class: _e([{ invalid: D.value.trim() && !S(vr)(D.value.trim()), disabled: S(C) !== "connected" }, "welcome-email-input"]) }, null, 10, d0), [[Ts, D.value]])])) : Y("", !0), m("div", h0, [ts(m("input", { "onUpdate:modelValue": f[3] || (f[3] = (h) => X.value = h), type: "text", placeholder: zs.value, onKeypress: Zn, onInput: Q, onChange: Q, disabled: !ys.value, class: _e([{ disabled: !ys.value }, "welcome-message-field"]) }, null, 42, f0), [[Ts, X.value]]), m("button", { class: _e(["welcome-send-button", { "aurora-send": Hs.value }]), style: fe(S(nn)), onClick: qt, disabled: !X.value.trim() || !un.value || Cn.value }, [Hs.value ? (v(), b("svg", g0, f[26] || (f[26] = [m("path", { d: "M12 19V5M12 5L5 12M12 5L19 12", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, null, -1)]))) : (v(), b("svg", v0, f[27] || (f[27] = [m("path", { d: "M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, null, -1)])))], 14, m0)])]), js.value ? (v(), b("div", { key: 0, class: "powered-by-welcome", style: fe(S(Nt)) }, [Tt(xr, { class: "chattermate-logo", size: 16 }), f[28] || (f[28] = m("a", { class: "cm-powered-link", href: "https://chattermate.chat", target: "_blank", rel: "noopener" }, [m("span", { class: "cm-powered-prefix" }, "Powered by "), m("strong", { class: "cm-brand" }, "ChatterMate")], -1))], 4)) : Y("", !0)], 6)) : Y("", !0), Vt.value && En.value ? (v(), b("div", { key: 5, class: "landing-page-fullscreen", style: fe(S(fs)) }, [m("div", y0, [m("div", b0, [m("h2", _0, q(En.value.heading), 1), m("div", w0, q(En.value.content), 1)]), m("div", k0, [m("button", { class: "landing-page-button", onClick: qp }, q(u.value), 1)])]), js.value ? (v(), b("div", { key: 0, class: "powered-by-landing", style: fe(S(Nt)) }, [Tt(xr, { class: "chattermate-logo", size: 16 }), f[29] || (f[29] = m("a", { class: "cm-powered-link", href: "https://chattermate.chat", target: "_blank", rel: "noopener" }, [m("span", { class: "cm-powered-prefix" }, "Powered by "), m("strong", { class: "cm-brand" }, "ChatterMate")], -1))], 4)) : Y("", !0)], 4)) : A.value && O.value ? (v(), b("div", { key: 6, class: "form-fullscreen", style: fe(S(fs)) }, [m("div", x0, [O.value.title || O.value.description ? (v(), b("div", S0, [O.value.title ? (v(), b("h2", T0, q(O.value.title), 1)) : Y("", !0), O.value.description ? (v(), b("p", A0, q(O.value.description), 1)) : Y("", !0)])) : Y("", !0), m("div", C0, [(v(!0), b(ve, null, Ve(O.value.fields, (h) => {
      var ae, Oe;
      return v(), b("div", { key: h.name, class: "form-field" }, [m("label", { for: `fullscreen-form-${h.name}`, class: "field-label" }, [On(q(h.label) + " ", 1), h.required ? (v(), b("span", R0, "*")) : Y("", !0)], 8, E0), h.type === "text" || h.type === "email" || h.type === "tel" ? (v(), b("input", { key: 0, id: `fullscreen-form-${h.name}`, type: h.type, placeholder: h.placeholder || "", required: h.required, minlength: h.minLength, maxlength: h.maxLength, value: He.value[h.name] || "", onInput: (ue) => dt(h.name, ue.target.value), onBlur: (ue) => dt(h.name, ue.target.value), class: _e(["form-input", { error: je.value[h.name] }]), autocomplete: h.type === "email" ? "email" : h.type === "tel" ? "tel" : "off", inputmode: h.type === "tel" ? "tel" : h.type === "email" ? "email" : "text" }, null, 42, O0)) : h.type === "number" ? (v(), b("input", { key: 1, id: `fullscreen-form-${h.name}`, type: "number", placeholder: h.placeholder || "", required: h.required, min: h.minLength, max: h.maxLength, value: He.value[h.name] || "", onInput: (ue) => dt(h.name, ue.target.value), class: _e(["form-input", { error: je.value[h.name] }]) }, null, 42, I0)) : h.type === "textarea" ? (v(), b("textarea", { key: 2, id: `fullscreen-form-${h.name}`, placeholder: h.placeholder || "", required: h.required, minlength: h.minLength, maxlength: h.maxLength, value: He.value[h.name] || "", onInput: (ue) => dt(h.name, ue.target.value), class: _e(["form-textarea", { error: je.value[h.name] }]), rows: "4" }, null, 42, L0)) : h.type === "select" ? (v(), b("select", { key: 3, id: `fullscreen-form-${h.name}`, required: h.required, value: He.value[h.name] || "", onChange: (ue) => dt(h.name, ue.target.value), class: _e(["form-select", { error: je.value[h.name] }]) }, [m("option", D0, q(h.placeholder || "Please select..."), 1), (v(!0), b(ve, null, Ve((Array.isArray(h.options) ? h.options : ((ae = h.options) == null ? void 0 : ae.split(`
`)) || []).filter((ue) => ue.trim()), (ue) => (v(), b("option", { key: ue, value: ue.trim() }, q(ue.trim()), 9, $0))), 128))], 42, N0)) : h.type === "checkbox" ? (v(), b("label", P0, [m("input", { id: `fullscreen-form-${h.name}`, type: "checkbox", required: h.required, checked: He.value[h.name] || !1, onChange: (ue) => dt(h.name, ue.target.checked), class: "form-checkbox" }, null, 40, F0), m("span", B0, q(h.label), 1)])) : h.type === "radio" ? (v(), b("div", z0, [(v(!0), b(ve, null, Ve((Array.isArray(h.options) ? h.options : ((Oe = h.options) == null ? void 0 : Oe.split(`
`)) || []).filter((ue) => ue.trim()), (ue) => (v(), b("label", { key: ue, class: "radio-field" }, [m("input", { type: "radio", name: `fullscreen-form-${h.name}`, value: ue.trim(), required: h.required, checked: He.value[h.name] === ue.trim(), onChange: (Me) => dt(h.name, ue.trim()), class: "form-radio" }, null, 40, M0), m("span", U0, q(ue.trim()), 1)]))), 128))])) : Y("", !0), je.value[h.name] ? (v(), b("div", j0, q(je.value[h.name]), 1)) : Y("", !0)]);
    }), 128))]), m("div", q0, [m("button", { onClick: f[4] || (f[4] = () => {
      console.log("Submit button clicked!"), zp();
    }), disabled: nt.value, class: "submit-form-button", style: fe(S(nn)) }, [nt.value ? (v(), b("span", V0, f[30] || (f[30] = [m("div", { class: "dot" }, null, -1), m("div", { class: "dot" }, null, -1), m("div", { class: "dot" }, null, -1)]))) : (v(), b("span", W0, q(O.value.submit_button_text || "Submit"), 1))], 12, H0)])]), js.value ? (v(), b("div", { key: 0, class: "powered-by-landing", style: fe(S(Nt)) }, [Tt(xr, { class: "chattermate-logo", size: 16 }), f[31] || (f[31] = m("a", { class: "cm-powered-link", href: "https://chattermate.chat", target: "_blank", rel: "noopener" }, [m("span", { class: "cm-powered-prefix" }, "Powered by "), m("strong", { class: "cm-brand" }, "ChatterMate")], -1))], 4)) : Y("", !0)], 4)) : !gl.value && he.value && !Si.value ? (v(), b("div", { key: 7, class: _e(["chat-panel", { "ask-anything-chat": Kt.value }]), style: fe(S(fs)) }, [Kt.value ? (v(), b("div", { key: 1, class: "ask-anything-top", style: fe(S(Qr)) }, [m("div", e_, [oe.value || S(qe) ? (v(), b("img", { key: 0, src: oe.value || S(qe), alt: S(U).human_agent_name || S(r), class: "header-avatar" }, null, 8, t_)) : Y("", !0), m("div", n_, [m("h3", { style: fe(S(Nt)) }, q(S(r)), 5), m("p", { class: "ask-anything-subtitle", style: fe(S(Nt)) }, q(S(s).welcome_subtitle || "Ask me anything. I'm here to help."), 5)])])], 4)) : (v(), b("div", { key: 0, class: "chat-header", style: fe(S(Qr)) }, [m("div", { class: "cm-header-sheen", style: fe({ background: "linear-gradient(90deg, transparent, " + (S(s).accent_color || "#C9F24E") + ", transparent)" }) }, null, 4), m("div", K0, [!oe.value && (Vs.value || !S(qe)) ? (v(), b("div", { key: 0, class: "header-orb", style: fe(ws.value) }, null, 4)) : oe.value || S(qe) ? (v(), b("img", { key: 1, src: oe.value || S(qe), alt: S(U).human_agent_name || S(r), class: "header-avatar" }, null, 8, G0)) : Y("", !0), m("div", Y0, [m("h3", { style: fe(S(Nt)) }, q(S(U).human_agent_name || S(r)), 5), m("div", Z0, [m("span", { class: _e(["status-indicator", tl.value.online ? "online" : "away"]) }, null, 2), m("span", J0, q(tl.value.text), 1)])])]), m("div", Q0, [lo.value ? (v(), b("button", { key: 0, type: "button", class: _e(["header-new-chat", { armed: Xn.value }]), style: fe(S(Nt)), disabled: Jn.value, title: S(Ko), "aria-label": S(Ko), "aria-expanded": Xn.value, onClick: ol }, f[32] || (f[32] = [m("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [m("path", { d: "M12 20h9" }), m("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" })], -1)]), 14, X0)) : Y("", !0), m("button", { type: "button", class: "header-minimize", style: fe(S(Nt)), title: "Minimize", "aria-label": "Minimize chat", onClick: sn }, f[33] || (f[33] = [m("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [m("path", { d: "M6 9l6 6 6-6" })], -1)]), 4)])], 4)), S(w) ? (v(), b("div", s_, f[34] || (f[34] = [m("div", { class: "loading-spinner" }, [m("div", { class: "dot" }), m("div", { class: "dot" }), m("div", { class: "dot" })], -1)]))) : Y("", !0), ks.value ? (v(), b("div", { key: 3, class: "cm-email-gate", style: fe(S(fs)) }, [m("div", { class: "cm-email-gate-orb", style: fe(ws.value) }, null, 4), m("h3", r_, q(S(s).welcome_title || "Before we start"), 1), f[35] || (f[35] = m("p", { class: "cm-email-gate-text" }, "Enter your email and we'll continue the chat.", -1)), ts(m("input", { "onUpdate:modelValue": f[5] || (f[5] = (h) => D.value = h), type: "email", inputmode: "email", autocomplete: "email", placeholder: "you@example.com", class: _e(["cm-email-gate-input", { invalid: !!es.value }]), disabled: pr.value, onKeyup: To(fl, ["enter"]), onInput: f[6] || (f[6] = (h) => es.value = "") }, null, 42, o_), [[Ts, D.value]]), es.value ? (v(), b("p", i_, q(es.value), 1)) : Y("", !0), m("button", { type: "button", class: "cm-email-gate-btn", style: fe(S(nn)), disabled: pr.value, onClick: fl }, q(pr.value ? "Please wait…" : "Continue to chat"), 13, a_)], 4)) : Y("", !0), Xn.value && lo.value ? (v(), In(dp, { key: 4, busy: Jn.value, error: Qn.value, onConfirm: il, onCancel: qs }, null, 8, ["busy", "error"])) : Y("", !0), ts(m("div", { class: "chat-messages", ref_key: "messagesContainer", ref: Wn, role: "log", "aria-label": "Messages" }, [S(Xt) ? (v(), In(xv, { key: 0, progress: S(Xt), onSkip: S(I), onHide: S(B) }, null, 8, ["progress", "onSkip", "onHide"])) : Y("", !0), Xp.value ? (v(), b("div", l_, [m("div", c_, [Vs.value || !S(qe) ? (v(), b("div", { key: 0, class: "cm-welcome-orb", style: fe(ws.value) }, null, 4)) : (v(), b("img", { key: 1, src: S(qe), alt: S(r), class: "cm-welcome-avatar" }, null, 8, u_)), m("div", { class: "message-bubble cm-welcome-bubble", style: fe(S(An)) }, q(ll.value), 5)])])) : Y("", !0), (v(!0), b(ve, null, Ve(S(l), (h, ae) => {
      var Oe, ue, Me, Pe, dr, hn, Ws, vl, yl, bl, _l, wl, kl, xl, Sl, Tl, Al, Cl, El, Rl;
      return v(), b(ve, { key: ae }, [S(P).isBefore(h) ? (v(), b("div", p_, [Vs.value || !S(qe) ? (v(), b("div", { key: 0, class: "cm-welcome-orb", style: fe(ws.value) }, null, 4)) : (v(), b("img", { key: 1, src: S(qe), alt: S(r), class: "cm-welcome-avatar" }, null, 8, d_)), m("div", { class: "message-bubble cm-welcome-bubble", style: fe(S(An)) }, q((Oe = z.value) == null ? void 0 : Oe.message), 5)])) : Y("", !0), m("div", { class: _e(["message", h.message_type === "bot" || h.message_type === "agent" ? "agent-message" : h.message_type === "system" ? "system-message" : h.message_type === "rating" ? "rating-message" : h.message_type === "form" ? "form-message" : h.message_type === "product" || h.shopify_output ? "product-message" : "user-message"]) }, [h.message_type === "bot" || h.message_type === "agent" ? (v(), b("div", h_, [oe.value ? (v(), b("img", { key: 0, src: oe.value, class: "cm-msg-avatar-img", alt: "" }, null, 8, f_)) : !Vs.value && S(qe) ? (v(), b("img", { key: 1, src: S(qe), class: "cm-msg-avatar-img", alt: "" }, null, 8, m_)) : (v(), b("div", { key: 2, class: "cm-msg-avatar-orb", style: fe(ws.value) }, null, 4))])) : Y("", !0), m("div", g_, [m("div", { class: "message-bubble", style: fe(h.message_type === "system" || h.message_type === "rating" || h.message_type === "form" || h.message_type === "product" || h.shopify_output ? {} : h.message_type === "user" ? S(nn) : S(An)) }, [h.message_type === "rating" ? (v(), b("div", v_, [m("p", y_, "Rate the chat session that you had with " + q(h.agent_name || S(U).human_agent_name || S(r) || "our agent"), 1), m("div", { class: _e(["star-rating", { submitted: Dt.value || h.isSubmitted }]) }, [(v(), b(ve, null, Ve(5, (N) => m("button", { key: N, class: _e(["star-button", { warning: N <= (h.isSubmitted ? h.finalRating : Ht.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Ht.value || h.selectedRating) <= 3, success: N <= (h.isSubmitted ? h.finalRating : Ht.value || h.selectedRating) && (h.isSubmitted ? h.finalRating : Ht.value || h.selectedRating) > 3, selected: N <= (h.isSubmitted ? h.finalRating : Ht.value || h.selectedRating) }]), onMouseover: (Pt) => !h.isSubmitted && be(N), onMouseleave: (Pt) => !h.isSubmitted && Wt, onClick: (Pt) => !h.isSubmitted && dn(N), disabled: Dt.value || h.isSubmitted }, " ★ ", 42, b_)), 64))], 2), h.showFeedback && !h.isSubmitted ? (v(), b("div", __, [m("div", w_, [ts(m("input", { "onUpdate:modelValue": (N) => h.feedback = N, placeholder: "Please share your feedback (optional)", disabled: Dt.value, maxlength: "500", class: "feedback-input" }, null, 8, k_), [[Ts, h.feedback]]), m("div", x_, q(((ue = h.feedback) == null ? void 0 : ue.length) || 0) + "/500", 1)]), m("button", { onClick: (N) => at(h.session_id, Ht.value, h.feedback), disabled: Dt.value || !Ht.value, class: "submit-rating-button", style: fe({ backgroundColor: S(s).accent_color || "var(--accent-solid)" }) }, q(Dt.value ? "Submitting..." : "Submit Rating"), 13, S_)])) : Y("", !0), h.isSubmitted && h.finalFeedback ? (v(), b("div", T_, [m("div", A_, [m("p", C_, q(h.finalFeedback), 1)])])) : h.isSubmitted ? (v(), b("div", E_, " Thank you for your rating! ")) : Y("", !0)])) : h.message_type === "form" ? (v(), b("div", R_, [(Pe = (Me = h.attributes) == null ? void 0 : Me.form_data) != null && Pe.title || (hn = (dr = h.attributes) == null ? void 0 : dr.form_data) != null && hn.description ? (v(), b("div", O_, [(vl = (Ws = h.attributes) == null ? void 0 : Ws.form_data) != null && vl.title ? (v(), b("h3", I_, q(h.attributes.form_data.title), 1)) : Y("", !0), (bl = (yl = h.attributes) == null ? void 0 : yl.form_data) != null && bl.description ? (v(), b("p", L_, q(h.attributes.form_data.description), 1)) : Y("", !0)])) : Y("", !0), m("div", N_, [(v(!0), b(ve, null, Ve((wl = (_l = h.attributes) == null ? void 0 : _l.form_data) == null ? void 0 : wl.fields, (N) => {
        var Pt, hr;
        return v(), b("div", { key: N.name, class: "form-field" }, [m("label", { for: `form-${N.name}`, class: "field-label" }, [On(q(N.label) + " ", 1), N.required ? (v(), b("span", $_, "*")) : Y("", !0)], 8, D_), N.type === "text" || N.type === "email" || N.type === "tel" ? (v(), b("input", { key: 0, id: `form-${N.name}`, type: N.type, placeholder: N.placeholder || "", required: N.required, minlength: N.minLength, maxlength: N.maxLength, value: He.value[N.name] || "", onInput: ($e) => dt(N.name, $e.target.value), onBlur: ($e) => dt(N.name, $e.target.value), class: _e(["form-input", { error: je.value[N.name] }]), disabled: nt.value, autocomplete: N.type === "email" ? "email" : N.type === "tel" ? "tel" : "off", inputmode: N.type === "tel" ? "tel" : N.type === "email" ? "email" : "text" }, null, 42, P_)) : N.type === "number" ? (v(), b("input", { key: 1, id: `form-${N.name}`, type: "number", placeholder: N.placeholder || "", required: N.required, min: N.min, max: N.max, value: He.value[N.name] || "", onInput: ($e) => dt(N.name, $e.target.value), class: _e(["form-input", { error: je.value[N.name] }]), disabled: nt.value }, null, 42, F_)) : N.type === "textarea" ? (v(), b("textarea", { key: 2, id: `form-${N.name}`, placeholder: N.placeholder || "", required: N.required, minlength: N.minLength, maxlength: N.maxLength, value: He.value[N.name] || "", onInput: ($e) => dt(N.name, $e.target.value), class: _e(["form-textarea", { error: je.value[N.name] }]), disabled: nt.value, rows: "3" }, null, 42, B_)) : N.type === "select" ? (v(), b("select", { key: 3, id: `form-${N.name}`, required: N.required, value: He.value[N.name] || "", onChange: ($e) => dt(N.name, $e.target.value), class: _e(["form-select", { error: je.value[N.name] }]), disabled: nt.value }, [m("option", M_, q(N.placeholder || "Select an option"), 1), (v(!0), b(ve, null, Ve((Array.isArray(N.options) ? N.options : ((Pt = N.options) == null ? void 0 : Pt.split(`
`)) || []).filter(($e) => $e.trim()), ($e) => (v(), b("option", { key: $e.trim(), value: $e.trim() }, q($e.trim()), 9, U_))), 128))], 42, z_)) : N.type === "checkbox" ? (v(), b("div", j_, [m("input", { id: `form-${N.name}`, type: "checkbox", checked: He.value[N.name] || !1, onChange: ($e) => dt(N.name, $e.target.checked), class: "form-checkbox", disabled: nt.value }, null, 40, q_), m("label", { for: `form-${N.name}`, class: "checkbox-label" }, q(N.placeholder || N.label), 9, H_)])) : N.type === "radio" ? (v(), b("div", V_, [(v(!0), b(ve, null, Ve((Array.isArray(N.options) ? N.options : ((hr = N.options) == null ? void 0 : hr.split(`
`)) || []).filter(($e) => $e.trim()), ($e) => (v(), b("div", { key: $e.trim(), class: "radio-option" }, [m("input", { id: `form-${N.name}-${$e.trim()}`, name: `form-${N.name}`, type: "radio", value: $e.trim(), checked: He.value[N.name] === $e.trim(), onChange: (Ti) => dt(N.name, $e.trim()), class: "form-radio", disabled: nt.value }, null, 40, W_), m("label", { for: `form-${N.name}-${$e.trim()}`, class: "radio-label" }, q($e.trim()), 9, K_)]))), 128))])) : Y("", !0), je.value[N.name] ? (v(), b("div", G_, q(je.value[N.name]), 1)) : Y("", !0)]);
      }), 128))]), m("div", Y_, [m("button", { onClick: () => {
        var N;
        console.log("Regular form submit button clicked!"), pt((N = h.attributes) == null ? void 0 : N.form_data);
      }, disabled: nt.value, class: "form-submit-button", style: fe(S(nn)) }, q(nt.value ? "Submitting..." : ((xl = (kl = h.attributes) == null ? void 0 : kl.form_data) == null ? void 0 : xl.submit_button_text) || "Submit"), 13, Z_)])])) : h.message_type === "user_input" ? (v(), b("div", J_, [(Sl = h.attributes) != null && Sl.prompt_message && h.attributes.prompt_message.trim() ? (v(), b("div", Q_, q(h.attributes.prompt_message), 1)) : Y("", !0), h.isSubmitted ? (v(), b("div", nw, [f[36] || (f[36] = m("strong", null, "Your input:", -1)), On(" " + q(h.submittedValue) + " ", 1), (Tl = h.attributes) != null && Tl.confirmation_message && h.attributes.confirmation_message.trim() ? (v(), b("div", sw, q(h.attributes.confirmation_message), 1)) : Y("", !0)])) : (v(), b("div", X_, [ts(m("textarea", { "onUpdate:modelValue": (N) => h.userInputValue = N, class: "user-input-textarea", placeholder: "Type your message here...", rows: "3", onKeydown: [To(Es((N) => yi(h), ["ctrl"]), ["enter"]), To(Es((N) => yi(h), ["meta"]), ["enter"])] }, null, 40, ew), [[Ts, h.userInputValue]]), m("button", { class: "user-input-submit-button", onClick: (N) => yi(h), disabled: !h.userInputValue || !h.userInputValue.trim() }, " Submit ", 8, tw)]))])) : h.shopify_output || h.message_type === "product" ? (v(), b("div", rw, [h.message ? (v(), b("div", { key: 0, innerHTML: S(Co)(((Cl = (Al = h.shopify_output) == null ? void 0 : Al.products) == null ? void 0 : Cl.length) > 0 ? Up(h.message) : h.message), class: "product-message-text" }, null, 8, ow)) : Y("", !0), (El = h.shopify_output) != null && El.products && h.shopify_output.products.length > 0 ? (v(), b("div", iw, [f[38] || (f[38] = m("h3", { class: "carousel-title" }, "Products", -1)), m("div", aw, [(v(!0), b(ve, null, Ve(h.shopify_output.products, (N) => {
        var Pt, hr;
        return v(), b("div", { key: N.id, class: "product-card-compact carousel-item", role: "group", "aria-label": N.title }, [(Pt = N.image) != null && Pt.src ? (v(), b("div", cw, [m("img", { src: N.image.src, alt: N.title, class: "product-thumbnail" }, null, 8, uw)])) : Y("", !0), m("div", pw, [m("div", dw, [m("div", hw, q(N.title), 1), N.variant_title && N.variant_title !== "Default Title" ? (v(), b("div", fw, q(N.variant_title), 1)) : Y("", !0), m("div", mw, q(N.price_formatted || S(a)(N.price, N.currency)), 1)]), m("div", gw, [S(Lv)(N, (hr = h.shopify_output) == null ? void 0 : hr.shop_domain) ? (v(), In(Uv, { key: 0, "variant-id": N.cart_variant_id }, null, 8, ["variant-id"])) : Y("", !0), m("button", { class: "view-details-button-compact", onClick: ($e) => {
          var Ti;
          return Mp(N, (Ti = h.shopify_output) == null ? void 0 : Ti.shop_domain);
        } }, f[37] || (f[37] = [On(" View product ", -1), m("span", { class: "external-link-icon" }, "↗", -1)]), 8, vw)])])], 8, lw);
      }), 128))])])) : !h.message && ((Rl = h.shopify_output) != null && Rl.products) && h.shopify_output.products.length === 0 ? (v(), b("div", yw, f[39] || (f[39] = [m("p", null, "No products found.", -1)]))) : !h.message && h.shopify_output && !h.shopify_output.products ? (v(), b("div", bw, f[40] || (f[40] = [m("p", null, "No products to display.", -1)]))) : Y("", !0)])) : (v(), b(ve, { key: 4 }, [S(re)(ae) ? (v(), b("div", { key: 0, class: "message-streaming", innerHTML: S(Co)(S(H)(ae, h.message)) }, null, 8, _w)) : (v(), b("div", { key: 1, innerHTML: S(Co)(h.message) }, null, 8, ww)), h.attachments && h.attachments.length > 0 ? (v(), b("div", kw, [(v(!0), b(ve, null, Ve(h.attachments, (N) => (v(), b("div", { key: N.id, class: "attachment-item" }, [S(ar)(N.content_type) ? (v(), b("div", xw, [m("img", { src: S(gs)(N.file_url), alt: N.filename, class: "attachment-image", onClick: Es((Pt) => S(Gn)({ url: N.file_url, filename: N.filename, type: N.content_type, file_url: S(gs)(N.file_url), size: void 0 }), ["stop"]), style: { cursor: "pointer" } }, null, 8, Sw), m("div", Tw, [m("a", { href: S(gs)(N.file_url), target: "_blank", class: "attachment-link" }, [f[41] || (f[41] = m("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [m("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), m("polyline", { points: "7 10 12 15 17 10" }), m("line", { x1: "12", y1: "15", x2: "12", y2: "3" })], -1)), On(" " + q(N.filename) + " ", 1), m("span", Cw, "(" + q(S(Bs)(N.file_size)) + ")", 1)], 8, Aw)])])) : (v(), b("a", { key: 1, href: S(gs)(N.file_url), target: "_blank", class: "attachment-link" }, [f[42] || (f[42] = m("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [m("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" })], -1)), On(" " + q(N.filename) + " ", 1), m("span", Rw, "(" + q(S(Bs)(N.file_size)) + ")", 1)], 8, Ew))]))), 128))])) : Y("", !0)], 64))], 4), co.value && (h.message_type === "bot" || h.message_type === "agent") && h.sources && h.sources.length ? (v(), b("div", Ow, [f[43] || (f[43] = m("span", { class: "citation-label" }, "Sources", -1)), (v(!0), b(ve, null, Ve(h.sources, (N, Pt) => (v(), b("span", { key: Pt, class: "citation-chip", title: dl(N) }, q(_i(N)), 9, Iw))), 128))])) : Y("", !0), m("div", Lw, [h.message_type === "user" ? (v(), b("span", Nw, " You ")) : Y("", !0)])])], 2), (v(!0), b(ve, null, Ve(S(Re)(ae + 1), (N, Pt) => (v(), In(ov, { key: `receipt-${ae}-${Pt}`, receipt: N }, null, 8, ["receipt"]))), 128))], 64);
    }), 128)), S(P).isLast() ? (v(), b("div", Dw, [Vs.value || !S(qe) ? (v(), b("div", { key: 0, class: "cm-welcome-orb", style: fe(ws.value) }, null, 4)) : (v(), b("img", { key: 1, src: S(qe), alt: S(r), class: "cm-welcome-avatar" }, null, 8, $w)), m("div", { class: "message-bubble cm-welcome-bubble", style: fe(S(An)) }, q((W = z.value) == null ? void 0 : W.message), 5)])) : Y("", !0), F.value.length ? (v(), In(Cv, { key: 3, chips: F.value, disabled: !un.value || S(g), onPick: $ }, null, 8, ["chips", "disabled"])) : Y("", !0), S(ct) ? (v(), In(Qg, { key: 4, pending: S(ct), onApprove: S(an), onDecline: S(xn) }, null, 8, ["pending", "onApprove", "onDecline"])) : Y("", !0), S(c) && !S(ct) ? (v(), b("div", { key: 5, class: _e(["typing-indicator", { "reading-indicator": co.value }]) }, [co.value ? (v(), b(ve, { key: 0 }, [f[44] || (f[44] = m("div", { class: "reading-bars", "aria-hidden": "true" }, [m("span"), m("span"), m("span")], -1)), f[45] || (f[45] = m("span", { class: "reading-label" }, "reading knowledge base", -1))], 64)) : (v(), b("div", { key: 1, class: "cm-typing-bubble", style: fe(S(An)) }, f[46] || (f[46] = [m("span", { class: "cm-typing-dot" }, null, -1), m("span", { class: "cm-typing-dot" }, null, -1), m("span", { class: "cm-typing-dot" }, null, -1)]), 4))], 2)) : Y("", !0)], 512), [[lf, !ks.value]]), ed.value ? (v(), b("div", Pw, [(v(!0), b(ve, null, Ve(bi.value, (h) => (v(), b("button", { key: h, type: "button", class: "cm-quick-action", disabled: !un.value, onClick: (ae) => Yn(h) }, q(h), 9, Fw))), 128))])) : Y("", !0), !V.value && !ks.value ? (v(), b("div", { key: 6, class: _e(["chat-input", { "ask-anything-input": Kt.value }]) }, [m("input", { ref_key: "fileInputRef", ref: Xr, type: "file", accept: pk, multiple: "", style: { display: "none" }, onChange: f[7] || (f[7] = (...h) => S(eo) && S(eo)(...h)) }, null, 544), S(Ae).length > 0 ? (v(), b("div", Bw, [(v(!0), b(ve, null, Ve(S(Ae), (h, ae) => (v(), b("div", { key: ae, class: "file-preview-widget" }, [m("div", zw, [S(vs)(h.type) ? (v(), b("img", { key: 0, src: S(lr)(h), alt: h.filename, class: "file-preview-image-widget", onClick: Es((Oe) => S(Gn)(h), ["stop"]), style: { cursor: "pointer" } }, null, 8, Mw)) : (v(), b("div", { key: 1, class: "file-preview-icon-widget", onClick: Es((Oe) => S(Gn)(h), ["stop"]), style: { cursor: "pointer" } }, f[47] || (f[47] = [m("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, [m("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }), m("polyline", { points: "13 2 13 9 20 9" })], -1)]), 8, Uw))]), m("div", jw, [m("div", qw, q(h.filename), 1), m("div", Hw, q(S(Bs)(h.size)), 1)]), m("button", { type: "button", class: "file-preview-remove-widget", onClick: (Oe) => S(ro)(ae), title: "Remove file" }, " × ", 8, Vw)]))), 128))])) : Y("", !0), el.value ? (v(), b("div", Ww, f[48] || (f[48] = [m("div", { class: "upload-spinner-widget" }, null, -1), m("span", { class: "upload-text-widget" }, "Uploading files...", -1)]))) : Y("", !0), m("div", Kw, [ts(m("input", { "onUpdate:modelValue": f[8] || (f[8] = (h) => X.value = h), type: "text", placeholder: zs.value, onKeypress: Zn, onInput: Q, onChange: Q, onPaste: f[9] || (f[9] = (...h) => S(cn) && S(cn)(...h)), onDrop: f[10] || (f[10] = (...h) => S(to) && S(to)(...h)), onDragover: f[11] || (f[11] = (...h) => S(no) && S(no)(...h)), onDragleave: f[12] || (f[12] = (...h) => S(so) && S(so)(...h)), disabled: !ys.value, class: _e({ disabled: !ys.value, "ask-anything-field": Kt.value }) }, null, 42, Gw), [[Ts, X.value]]), jp.value ? (v(), b("button", { key: 0, type: "button", class: "attach-button", disabled: el.value, onClick: f[13] || (f[13] = (...h) => S(oo) && S(oo)(...h)), title: `Attach files (${S(Ae).length}/${Vc} used) or paste screenshots` }, f[49] || (f[49] = [m("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, [m("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })], -1), m("span", { class: "attach-button-glow" }, null, -1)]), 8, Yw)) : Y("", !0), m("button", { class: _e(["send-button", { "ask-anything-send": Kt.value }]), "aria-label": "Send message", style: fe(S(nn)), onClick: qt, disabled: !X.value.trim() && S(Ae).length === 0 || !un.value || Cn.value }, f[50] || (f[50] = [m("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, [m("path", { d: "M12 19V5M5 12l7-7 7 7", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })], -1)]), 14, Zw)]), Cn.value ? (v(), b("p", Jw, q(S(qv)), 1)) : Y("", !0)], 2)) : V.value && !ks.value ? (v(), b("div", Qw, [m("div", Xw, [f[51] || (f[51] = m("p", { class: "ended-text" }, "This chat has ended.", -1)), m("button", { class: "start-new-conversation-button", style: fe(S(nn)), onClick: Yp }, " Click here to start a new conversation ", 4)])])) : Y("", !0), ul.value ? (v(), b("div", ek, q(S(Ic)), 1)) : Y("", !0), js.value ? (v(), b("div", { key: 9, class: "powered-by", style: fe(S(Nt)) }, [Tt(xr, { class: "chattermate-logo", size: 16 }), f[52] || (f[52] = m("a", { class: "cm-powered-link", href: "https://chattermate.chat", target: "_blank", rel: "noopener" }, [m("span", { class: "cm-powered-prefix" }, "Powered by "), m("strong", { class: "cm-brand" }, "ChatterMate")], -1))], 4)) : Y("", !0)], 6)) : Y("", !0), cr.value ? (v(), b("div", tk, [m("div", nk, [f[53] || (f[53] = m("h3", null, "Rate your conversation", -1)), m("div", sk, [(v(), b(ve, null, Ve(5, (h) => m("button", { key: h, onClick: (ae) => bs.value = h, class: _e([{ active: h <= bs.value }, "star-button"]) }, " ★ ", 10, rk)), 64))]), ts(m("textarea", { "onUpdate:modelValue": f[14] || (f[14] = (h) => Us.value = h), placeholder: "Additional feedback (optional)", class: "rating-feedback" }, null, 512), [[Ts, Us.value]]), m("div", ok, [m("button", { onClick: f[15] || (f[15] = (h) => p.submitRating(bs.value, Us.value)), disabled: !bs.value, class: "submit-button", style: fe(S(nn)) }, " Submit ", 12, ik), m("button", { onClick: f[16] || (f[16] = (h) => cr.value = !1), class: "skip-rating" }, " Skip ")])])])) : Y("", !0), S(Kn) ? (v(), b("div", { key: 9, class: "preview-modal-overlay", onClick: f[19] || (f[19] = (...h) => S(jt) && S(jt)(...h)) }, [m("div", { class: "preview-modal-content", onClick: f[18] || (f[18] = Es(() => {
    }, ["stop"])) }, [m("button", { class: "preview-modal-close", onClick: f[17] || (f[17] = (...h) => S(jt) && S(jt)(...h)) }, "×"), S(ms) && S(vs)(S(ms).type) ? (v(), b("div", ak, [m("img", { src: S(lr)(S(ms)), alt: S(ms).filename, class: "preview-modal-image" }, null, 8, lk), m("div", ck, q(S(ms).filename), 1)])) : Y("", !0)])])) : Y("", !0)], 6)) : (v(), b("div", uk));
  };
} }), hk = Un(dk, [["__scopeId", "data-v-4e56e45f"]]);
window.process || (window.process = { env: { NODE_ENV: "production" } });
async function fk() {
  if (!await cy()) return;
  const e = window.__INITIAL_DATA__, t = new URL(window.location.href), n = t.searchParams.get("preview") === "true", s = (i) => {
    const a = t.searchParams.get(i);
    if (!(!a || a === "undefined" || a.trim() === "")) return a;
  }, r = n ? s("widget_id") || (e == null ? void 0 : e.widgetId) || void 0 : (e == null ? void 0 : e.widgetId) || void 0, o = n ? (e == null ? void 0 : e.initialToken) || s("token") || void 0 : (e == null ? void 0 : e.initialToken) || void 0;
  Ef(hk, { widgetId: r, token: o || void 0, initialAuthError: null }).mount("#app"), uy();
}
fk();
