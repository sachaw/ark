import { createRoot, flush, onSettled, createEffect, createSignal, createRenderEffect } from "solid-js"

const t = (name: string, fn: (done: () => void) => void) => {
  createRoot((d) => { let f = false; fn(() => { f = true }); flush();
    setTimeout(() => { console.log(`  ${f ? "FIRES" : "never "}  ${name}`); d() }, 5) })
}
t("bare createRoot, onSettled alone", (done) => { onSettled(done) })
t("createRoot + an effect present", (done) => {
  const [c] = createSignal(0); createEffect(() => c(), () => {}); onSettled(done)
})
t("createRoot + renderEffect present", (done) => {
  const [c] = createSignal(0); createRenderEffect(() => c(), () => {}); onSettled(done)
})
t("onSettled registered INSIDE an effect apply", (done) => {
  const [c] = createSignal(0); createEffect(() => c(), () => { onSettled(done) })
})
