/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// The embedding page's side of in-app actions, bundled into the embed loader.
//
// ChatterMate.registerActions({ name: handler }) — a handler is an async
// function (args) => result, or { run, preview } where preview(args) returns
// { before, after } (or null) for actions that ask before overwriting.
// ChatterMate.setContext({...}) — page state the agent may use (not verified).
//
// The widget frame asks for a run with ACTION_RUN; the result goes back as
// ACTION_DONE. Results are kept per call in sessionStorage, so a call the frame
// replays after a reconnect gets the same answer instead of running twice.

const NAME_PATTERN = /^[a-z][a-z0-9_]{0,63}$/
const RESULTS_KEY = 'cm_action_results'
// Recent call answers kept for replays; older ones are dropped.
const RESULTS_KEPT = 50

function toHandler(value) {
  if (typeof value === 'function') return { run: value, preview: null }
  if (value && typeof value.run === 'function') {
    return { run: value.run, preview: typeof value.preview === 'function' ? value.preview : null }
  }
  return null
}

// Only plain JSON crosses to the widget: functions, DOM nodes and cycles are dropped.
function toJson(value) {
  if (value === undefined) return null
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (e) {
    return null
  }
}

function errorText(error) {
  if (error && typeof error.message === 'string') return error.message.slice(0, 200)
  return 'The action failed.'
}

export function createHostActions(postToFrame, storage) {
  const handlers = Object.create(null)
  let context = null

  // [[callId, answer], ...], newest last.
  function readAll() {
    try {
      const raw = storage && storage.getItem(RESULTS_KEY)
      const list = raw ? JSON.parse(raw) : []
      return Array.isArray(list) ? list : []
    } catch (e) {
      return []
    }
  }

  function readCached(callId) {
    const entry = readAll().find(function (item) { return item[0] === callId })
    return entry ? entry[1] : null
  }

  function writeCached(callId, answer) {
    try {
      if (!storage) return
      const list = readAll().filter(function (item) { return item[0] !== callId })
      list.push([callId, answer])
      storage.setItem(RESULTS_KEY, JSON.stringify(list.slice(-RESULTS_KEPT)))
    } catch (e) {
      /* storage full or blocked: the call still answers, it just isn't replay-safe */
    }
  }

  // Tell the frame what the page offers. Called on register and whenever the widget mounts.
  function announce() {
    postToFrame({ type: 'HOST_ACTIONS', names: Object.keys(handlers) })
    if (context) postToFrame({ type: 'HOST_CONTEXT', context })
  }

  function register(map) {
    if (!map || typeof map !== 'object') return
    Object.keys(map).forEach(function (name) {
      const handler = toHandler(map[name])
      if (NAME_PATTERN.test(name) && handler) handlers[name] = handler
      else console.warn('ChatterMate: ignored action "' + name + '" (needs a lowercase name and a function)')
    })
    announce()
  }

  function setContext(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return
    context = toJson(value)
    postToFrame({ type: 'HOST_CONTEXT', context })
  }

  function withTimeout(promise, seconds) {
    return new Promise(function (resolve, reject) {
      const timer = setTimeout(function () { reject(new Error('timeout')) }, Math.max(1, seconds) * 1000)
      promise.then(
        function (value) { clearTimeout(timer); resolve(value) },
        function (error) { clearTimeout(timer); reject(error) },
      )
    })
  }

  async function run(message) {
    const callId = String(message.callId || '')
    if (!callId) return
    const cached = readCached(callId)
    if (cached) {
      postToFrame(Object.assign({ type: 'ACTION_DONE', callId: callId }, cached))
      return
    }
    const handler = handlers[message.name]
    if (!handler) {
      // Not cached: the page may register it before a replay.
      postToFrame({ type: 'ACTION_DONE', callId: callId, status: 'error', error: 'This page has no code for that action.' })
      return
    }
    let answer
    try {
      const result = await withTimeout(Promise.resolve().then(function () {
        return handler.run(message.args || {})
      }), Number(message.timeoutS) || 20)
      answer = { status: 'ok', result: toJson(result) }
    } catch (error) {
      answer = error && error.message === 'timeout'
        ? { status: 'timeout' }
        : { status: 'error', error: errorText(error) }
    }
    writeCached(callId, answer)
    postToFrame(Object.assign({ type: 'ACTION_DONE', callId: callId }, answer))
  }

  async function preview(message) {
    const handler = handlers[message.name]
    let result = null
    if (handler && handler.preview) {
      try {
        result = toJson(await handler.preview(message.args || {}))
      } catch (e) {
        result = null
      }
    }
    postToFrame({ type: 'ACTION_PREVIEW_DONE', callId: message.callId, preview: result })
  }

  // A message from the widget frame. Returns true when it was about actions.
  function handleFrameMessage(data) {
    if (data.type === 'ACTION_RUN') {
      run(data)
      return true
    }
    if (data.type === 'ACTION_PREVIEW') {
      preview(data)
      return true
    }
    return false
  }

  return { register: register, setContext: setContext, announce: announce, handleFrameMessage: handleFrameMessage }
}
