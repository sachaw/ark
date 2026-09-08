import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" })
for (const k of ["window","document","navigator","HTMLElement","Element","Node","Text","Comment","DocumentFragment","SVGElement"]) {
  if (globalThis[k] === undefined && win[k] !== undefined) globalThis[k] = win[k]
}
const { render } = await import("@solidjs/web")
const { flush, createSignal } = await import("solid-js")
const { IconCheck, IconHeartFilled } = await import("./dist/icons.js")

let pass = 0, fail = 0
const check = (l, c, extra="") => { c ? pass++ : fail++; console.log(`  ${c ? "PASS" : "FAIL"}  ${l}${c ? "" : "  " + extra}`) }
const settle = async () => { await new Promise(r => setTimeout(r, 0)); flush() }

const root = document.createElement("div"); document.body.appendChild(root)
const [size, setSize] = createSignal(24)
const [cls, setCls] = createSignal("a")
const d = render(() => IconCheck({ get size() { return size() }, get class() { return cls() }, "data-testid": "chk", title: "Done" }), root)
await settle()
const svg = root.querySelector("svg")
check("renders an svg", !!svg)
check("outline stroke default", svg.getAttribute("stroke") === "currentColor", svg.getAttribute("stroke"))
check("icon class applied", svg.getAttribute("class")?.includes("tabler-icon-check"), svg.getAttribute("class"))
check("consumer class merged", svg.getAttribute("class")?.includes("a"), svg.getAttribute("class"))
check("rest props forwarded", svg.getAttribute("data-testid") === "chk")
check("title child rendered", root.querySelector("title")?.textContent === "Done")
check("icon path rendered", !!root.querySelector("path[d]"))
check("initial size", svg.getAttribute("width") === "24", svg.getAttribute("width"))

const svgId = svg
setSize(32); setCls("b"); await settle()
check("size is reactive", root.querySelector("svg").getAttribute("width") === "32", root.querySelector("svg").getAttribute("width"))
check("class is reactive", root.querySelector("svg").getAttribute("class")?.includes("b"), root.querySelector("svg").getAttribute("class"))
check("element identity stable (no churn)", svgId === root.querySelector("svg"))

const r2 = document.createElement("div"); document.body.appendChild(r2)
render(() => IconHeartFilled({ color: "red" }), r2)
await settle()
check("filled variant uses fill", r2.querySelector("svg").getAttribute("fill") === "red", r2.querySelector("svg").getAttribute("fill"))

console.log(`\n  ${pass} passed, ${fail} failed`)
d(); process.exit(fail ? 1 : 0)
