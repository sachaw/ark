import "./dom-setup.ts"
import { createRoot, createMemo, flush } from "solid-js"
import * as select from "@zag-js/select"
import { useMachine, normalizeProps } from "../../packages/solid/zag-solid/src/index.ts"

let pass = 0, fail = 0
const check = (l: string, c: boolean, extra = "") => { c ? pass++ : fail++; console.log(`  ${c ? "PASS" : "FAIL"}  ${l}${c ? "" : "  " + extra}`) }
const settle = async () => { await new Promise((r) => setTimeout(r, 0)); flush() }

const collection = select.collection({ items: [{ label: "React", value: "react" }, { label: "Solid", value: "solid" }] })

createRoot((dispose) => {
  const service: any = useMachine(select.machine as any, () => ({ id: "s", collection }))
  const api = createMemo(() => select.connect(service, normalizeProps as any))
  let memoRuns = 0
  const counted = createMemo(() => { memoRuns++; return (api() as any).valueAsString })

  ;(async () => {
    await settle()
    check("initial valueAsString empty", counted() === "", `got ${JSON.stringify(counted())}`)
    const runsBefore = memoRuns

    // select through the api, the way a click would
    ;(api() as any).selectValue("react")
    await settle()

    check("api memo re-ran after selectValue", memoRuns > runsBefore, `runs ${runsBefore} -> ${memoRuns}`)
    check("valueAsString updates to 'React'", counted() === "React", `got ${JSON.stringify(counted())}`)

    console.log(`\n  ${pass} passed, ${fail} failed`)
    dispose(); process.exit(fail ? 1 : 0)
  })()
})
