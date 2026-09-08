import "./dom-setup.ts"
import { createRoot, createSignal, flush } from "solid-js"
import * as collapsible from "@zag-js/collapsible"
import { useMachine } from "../../packages/solid/zag-solid/src/machine.ts"

let pass = 0, fail = 0
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  ok ? pass++ : fail++
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`)
}
const settle = async () => { await new Promise((r) => setTimeout(r, 0)); flush() }

createRoot((dispose) => {
  // All machines must be created synchronously under the owner: Solid 2's
  // onSettled hard-errors (SETTLED_CLEANUP_UNOWNED) if it returns a cleanup
  // with no owner, and an `await` loses the ambient owner.
  const changes: boolean[] = []
  const s1: any = useMachine(collapsible.machine as any, () => ({
    id: "c1", onOpenChange: (d: any) => changes.push(d.open),
  }))
  const s2: any = useMachine(collapsible.machine as any, () => ({ id: "c2" }))
  const s3: any = useMachine(collapsible.machine as any, () => ({ id: "c3", defaultOpen: true }))
  const [open, setOpen] = createSignal(false)
  const s4: any = useMachine(collapsible.machine as any, () => ({ id: "c4", open: open() }))

  ;(async () => {
    await settle()
    check("initial state is 'closed'", s1.state.get(), "closed")
    check("matches() works", s1.state.matches("closed"), true)
    check("defaultOpen honoured", s3.state.get(), "open")
    check("controlled starts closed", s4.state.get(), "closed")

    s1.send({ type: "open" })
    await settle()
    check("send{open} -> 'open'", s1.state.get(), "open")
    check("onOpenChange fired [true]", changes, [true])

    s1.send({ type: "close" })
    await settle()
    check("send{close} leaves 'open'", s1.state.get() !== "open", true)
    check("onOpenChange fired [true,false]", changes, [true, false])

    // Read-after-write inside one tick: the machine reads state back
    // synchronously. This is what a naive port gets wrong.
    s2.send({ type: "open" })
    s2.send({ type: "close" })
    await settle()
    check("two sends in one tick -> not left 'open'", s2.state.get() !== "open", true)

    // Controlled mode follows the prop.
    setOpen(true)
    await settle()
    check("controlled follows prop -> open", s4.state.get(), "open")

    console.log(`\n  ${pass} passed, ${fail} failed`)
    dispose()
    process.exit(fail ? 1 : 0)
  })()
})
