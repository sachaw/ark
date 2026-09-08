import "./dom-setup.ts"
import { createRoot, flush } from "solid-js"
import * as select from "@zag-js/select"
import { useMachine } from "../../packages/solid/zag-solid/src/machine.ts"

let pass = 0, fail = 0
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  ok ? pass++ : fail++
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`)
}
const settle = async () => { await new Promise((r) => setTimeout(r, 0)); flush() }

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
]
const collection = select.collection({ items })

createRoot((dispose) => {
  const picked: string[][] = []
  const s: any = useMachine(select.machine as any, () => ({
    id: "s1", collection,
    onValueChange: (d: any) => picked.push(d.value),
  }))

  ;(async () => {
    await settle()
    check("select starts idle", s.state.get(), "idle")
    check("collection wired through", s.computed("hasSelectedItems"), false)

    // context bindable write + read-back
    s.context.set("value", ["banana"])
    await settle()
    check("context.set('value') reads back", s.context.get("value"), ["banana"])
    check("computed recomputes off new context", s.computed("hasSelectedItems"), true)
    check("onValueChange fired", picked, [["banana"]])

    // machine transition on a complex machine
    s.send({ type: "TRIGGER.CLICK" })
    await settle()
    check("TRIGGER.CLICK opens", s.state.get() !== "idle", true)

    s.send({ type: "CLOSE" })
    await settle()
    check("CLOSE returns to focused (focus goes back to trigger)", s.state.get(), "focused")

    // two context writes in one tick must compose, not clobber
    s.context.set("value", ["apple"])
    s.context.set("value", ["cherry"])
    await settle()
    check("last write wins across one tick", s.context.get("value"), ["cherry"])

    console.log(`\n  ${pass} passed, ${fail} failed`)
    dispose()
    process.exit(fail ? 1 : 0)
  })()
})
