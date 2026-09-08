import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" })
for (const k of ["window","document","navigator","HTMLElement","Element","Node","Text","Comment","DocumentFragment"]) {
  if (globalThis[k] === undefined && win[k] !== undefined) globalThis[k] = win[k]
}
const { render } = await import("@solidjs/web")
const { flush, createSignal, createMemo } = await import("solid-js")
const { ark } = await import("./ark/components/factory.js")
const { mergeProps } = await import("./zag-solid/index.js")
const settle = async () => { for (let i=0;i<3;i++){ await new Promise(r=>setTimeout(r,0)); flush() } }

const [n, setN] = createSignal(0)
const api = createMemo(() => ({ "data-state": n() > 0 ? "open" : "closed" }))

// Parent renders children; a DESCENDANT reads the reactive api in its body.
let parentKidReads = 0
const r = document.createElement("div"); document.body.appendChild(r)
const Child = () => {
  const merged = mergeProps(() => api(), { "data-part": "kid" })   // descendant reads api
  return ark.span(merged)
}
const Parent = (props) => ark.div({ "data-part": "host", get children() { return props.children } })
render(() => Parent({ get children() { parentKidReads++; return Child() } }), r)
await settle()
const kid = r.querySelector('[data-part="kid"]')
const k0 = parentKidReads
setN(1); await settle()
console.log(`  descendant reads api: parent children reads ${k0} -> ${parentKidReads}`)
console.log(`  child identity stable: ${kid === r.querySelector('[data-part="kid"]')}`)
console.log(`  child data-state now : ${r.querySelector('[data-part="kid"]')?.getAttribute("data-state")}`)
