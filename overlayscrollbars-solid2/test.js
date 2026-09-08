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
const settle = async () => { for (let i=0;i<4;i++){ await new Promise(r => setTimeout(r, 0)); flush() } }

const root = document.createElement("div"); document.body.appendChild(root)
let gotRef = null
const [cls, setCls] = createSignal("a")
const [kids, setKids] = createSignal("hello")

const dispose = render(() => OverlayScrollbarsComponent({
  get class() { return cls() },
  "data-testid": "scroller",
  ref: (r) => { gotRef = r },
  get children() { return kids() },
}), root)
await settle()

const host = root.querySelector('[data-testid="scroller"]')
check("renders the host element", !!host)
check("defaults to a div", host?.tagName === "DIV", host?.tagName)
check("carries the init marker", host?.hasAttribute("data-overlayscrollbars-initialize"))
check("rest props forwarded (class)", host?.getAttribute("class") === "a", host?.getAttribute("class"))
check("contents wrapper present", !!root.querySelector("[data-overlayscrollbars-contents]"))
check("children rendered", root.textContent.includes("hello"))
check("ref callback fired", !!gotRef)
check("ref exposes getElement()", gotRef?.getElement() === host)
check("ref exposes osInstance()", typeof gotRef?.osInstance === "function")
check("OverlayScrollbars actually initialised", !!gotRef?.osInstance(), String(gotRef?.osInstance()))

const hostId = host
setCls("b"); setKids("world"); await settle()
check("class is reactive", root.querySelector('[data-testid="scroller"]')?.getAttribute("class") === "b")
check("children are reactive", root.textContent.includes("world"))
check("host identity stable (no churn)", hostId === root.querySelector('[data-testid="scroller"]'))

// element="body" variant skips the contents wrapper
const r2 = document.createElement("div"); document.body.appendChild(r2)
render(() => OverlayScrollbarsComponent({ element: "span", "data-testid": "s2", get children() { return "x" } }), r2)
await settle()
check("custom element honoured", r2.querySelector('[data-testid="s2"]')?.tagName === "SPAN", r2.querySelector('[data-testid="s2"]')?.tagName)

console.log(`\n  ${pass} passed, ${fail} failed`)
dispose(); process.exit(fail ? 1 : 0)
