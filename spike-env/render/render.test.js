import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" })
for (const k of ["window","document","navigator","HTMLElement","Element","Node","CustomEvent","Event","MutationObserver","ResizeObserver","getComputedStyle","DocumentFragment","HTMLInputElement","SVGElement","Text","Comment"]) {
  if (globalThis[k] === undefined && win[k] !== undefined) globalThis[k] = win[k]
}
globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(Date.now()), 0)
globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id)

const { render } = await import("@solidjs/web")
const { flush } = await import("solid-js")
const { Collapsible } = await import("./ark/components/collapsible/index.js")

let pass = 0, fail = 0
const check = (label, cond) => { cond ? pass++ : fail++; console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`) }
const settle = async () => { await new Promise((r) => setTimeout(r, 0)); flush() }

const root = document.createElement("div")
document.body.appendChild(root)

const dispose = render(
  () => Collapsible.Root({
    get children() {
      return [
        Collapsible.Trigger({ children: "Toggle" }),
        Collapsible.Content({ children: "Panel body" }),
      ]
    },
  }),
  root,
)

await settle()
const html = root.innerHTML
console.log("  rendered:", html.slice(0, 220))

check("renders a trigger button", /<button[^>]*>Toggle<\/button>/.test(html))
check("emits ark's data-scope", html.includes('data-scope="collapsible"'))
check("trigger carries aria-controls", html.includes("aria-controls="))
check("content part rendered", html.includes('data-part="content"'))
check("starts closed (data-state)", html.includes('data-state="closed"'))

const btn = root.querySelector("button")
btn.click()
await settle(); await settle()
const after = root.innerHTML
check("click opens it (data-state=open)", after.includes('data-state="open"'))
check("content still present after toggle", after.includes('data-part="content"'))

console.log(`\n  ${pass} passed, ${fail} failed`)
dispose()
process.exit(fail ? 1 : 0)
