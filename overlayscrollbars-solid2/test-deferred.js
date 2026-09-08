import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" })
for (const k of ["window","document","navigator","HTMLElement","Element","Node","Text","Comment","DocumentFragment","MutationObserver","ResizeObserver","getComputedStyle","CustomEvent","Event","DOMRect"]) {
  if (globalThis[k] === undefined && win[k] !== undefined) globalThis[k] = win[k]
}
globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(Date.now()), 0)
globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id)
globalThis.requestIdleCallback ??= (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 1 }), 0)
globalThis.cancelIdleCallback ??= (id) => clearTimeout(id)

const { render } = await import("@solidjs/web")
const { flush, createSignal } = await import("solid-js")
const { OverlayScrollbarsComponent } = await import("./dist/OverlayScrollbarsComponent.js")

let pass = 0, fail = 0
const check = (l, c, extra = "") => { c ? pass++ : fail++; console.log(`  ${c ? "PASS" : "FAIL"}  ${l}${c ? "" : "  " + extra}`) }
const settle = async (n = 8) => { for (let i=0;i<n;i++){ await new Promise(r => setTimeout(r, 0)); flush() } }

// exactly meridian's ScrollArea usage: defer:true, reactive options, events
const [dir, setDir] = createSignal("vertical")
const options = () => ({
  scrollbars: { theme: "os-theme-light", autoHide: "scroll", autoHideDelay: 400 },
  overflow: { x: dir() === "vertical" ? "hidden" : "scroll", y: "scroll" },
})
let initialisedVp = null, updatedCount = 0
const events = {
  initialized: (i) => { initialisedVp = i.elements().viewport },
  updated: () => { updatedCount++ },
}
let osRef = null

const root = document.createElement("div"); document.body.appendChild(root)
const dispose = render(() => OverlayScrollbarsComponent({
  ref: (r) => { osRef = r },
  class: "h-full w-full",
  get options() { return options() },
  events,
  defer: true,
  get children() { return "content" },
}), root)

await settle(2)
check("ref callback fires", !!osRef)
// NOTE: deliberately not asserting osInstance() is null here — with a
// setTimeout-backed requestIdleCallback shim the deferred init may already
// have run. The meaningful property is that it completes, below.

await settle(12)
check("deferred init completes", !!osRef?.osInstance())
check("'initialized' event fired with a viewport", !!initialisedVp)
check("viewport is inside the host", root.contains(initialisedVp))
check("options applied", osRef?.osInstance()?.options()?.overflow?.x === "hidden", JSON.stringify(osRef?.osInstance()?.options()?.overflow))

const before = JSON.stringify(osRef.osInstance().options().overflow)
setDir("both"); await settle()
const after = JSON.stringify(osRef.osInstance().options().overflow)
check("reactive options push to the live instance", before !== after, `${before} -> ${after}`)
check("overflow.x now scroll", osRef.osInstance().options().overflow.x === "scroll", after)

const u0 = updatedCount
osRef.osInstance().update(true); await settle()
check("'updated' event wired", updatedCount > u0, `${u0} -> ${updatedCount}`)

const inst = osRef.osInstance()
dispose(); await settle()
check("destroyed on dispose", !inst.state || inst.state().destroyed === true, JSON.stringify(inst.state?.()))

console.log(`\n  ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
