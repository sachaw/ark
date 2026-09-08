import { createRoot, flush, onSettled } from "solid-js"
import * as collapsible from "@zag-js/collapsible"
import { useMachine } from "../../packages/solid/zag-solid/src/machine.ts"

createRoot(() => {
  let fired = false
  onSettled(() => { fired = true; console.log("  [bare onSettled] FIRED") })
  const s: any = useMachine(collapsible.machine as any, () => ({ id: "d1" }))
  console.log("  status right after useMachine:", s.getStatus())
  flush()
  console.log("  status after flush():", s.getStatus(), "| bare onSettled fired:", fired)
  setTimeout(() => {
    console.log("  status after macrotask:", s.getStatus(), "| bare onSettled fired:", fired)
    flush()
    console.log("  status after macrotask+flush:", s.getStatus())
    process.exit(0)
  }, 10)
})
