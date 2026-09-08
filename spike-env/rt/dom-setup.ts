import { Window } from "happy-dom"
const win = new Window({ url: "http://localhost" }) as any
for (const k of ["window","document","navigator","HTMLElement","Element","Node","CustomEvent","Event","MutationObserver","ResizeObserver","getComputedStyle","DocumentFragment","HTMLInputElement"]) {
  if ((globalThis as any)[k] === undefined && win[k] !== undefined) (globalThis as any)[k] = win[k]
}
;(globalThis as any).requestAnimationFrame ??= (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as unknown as number
;(globalThis as any).cancelAnimationFrame ??= (id: number) => clearTimeout(id)
