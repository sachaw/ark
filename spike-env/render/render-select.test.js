import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" })
for (const k of ["window","document","navigator","HTMLElement","Element","Node","CustomEvent","Event","MutationObserver","ResizeObserver","getComputedStyle","DocumentFragment","HTMLInputElement","SVGElement","Text","Comment","DOMRect"]) {
  if (globalThis[k] === undefined && win[k] !== undefined) globalThis[k] = win[k]
}
globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(Date.now()), 0)
globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id)

const { render } = await import("@solidjs/web")
const { flush } = await import("solid-js")
const { Select, createListCollection } = await import("./ark/components/select/index.js")

let pass = 0, fail = 0
const check = (label, cond) => { cond ? pass++ : fail++; console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`) }
const settle = async () => { await new Promise((r) => setTimeout(r, 0)); flush() }

const collection = createListCollection({
  items: [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ],
})

const root = document.createElement("div")
document.body.appendChild(root)
let changed = null

const dispose = render(
  () => Select.Root({
    collection,
    onValueChange: (d) => { changed = d.value },
    get children() {
      return [
        Select.Label({ children: "Fruit" }),
        Select.Control({ get children() { return Select.Trigger({ children: "Pick one" }) } }),
        Select.Content({
          get children() {
            return collection.items.map((item) =>
              Select.Item({ item, get children() { return Select.ItemText({ children: item.label }) } }),
            )
          },
        }),
      ]
    },
  }),
  root,
)

await settle()
const html = root.innerHTML
console.log("  rendered:", html.slice(0, 200))

check("select scope present", html.includes('data-scope="select"'))
check("label rendered", html.includes('data-part="label"'))
check("trigger rendered", html.includes('data-part="trigger"'))
check("unique id generated (no ':undefined')", !html.includes(":undefined"))
check("trigger has aria-haspopup", html.includes('aria-haspopup='))
check("items rendered from the collection", (html.match(/data-part="item"/g) || []).length === 2)
check("item text present", html.includes("Apple") && html.includes("Banana"))
check("starts closed", html.includes('data-state="closed"'))

console.log(`\n  ${pass} passed, ${fail} failed`)
dispose()
process.exit(fail ? 1 : 0)
