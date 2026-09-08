const solid = await import("solid-js");
const web   = await import("@solidjs/web");
const need = ["JSX","createMemo","Accessor","createUniqueId","Show","splitProps","createSignal",
  "createEffect","onCleanup","onMount","Index","For","untrack","mergeProps","createContext",
  "useContext","ComponentProps","children","on","ParentProps","Context","merge","omit","onSettled",
  "Loading","Errored","Repeat","snapshot","createStore","reconcile","flush","isPending","createRoot"];
const sk = new Set(Object.keys(solid)), wk = new Set(Object.keys(web));
console.log("solid-js runtime exports:", sk.size, "| @solidjs/web exports:", wk.size);
let miss=[];
for (const n of need) {
  const where = sk.has(n) ? "solid-js" : wk.has(n) ? "@solidjs/web" : null;
  if (!where) miss.push(n);
  console.log(`  ${where ? "OK  " : "GONE"}  ${n.padEnd(16)} ${where ?? "(type-only or removed)"}`);
}
console.log("\nNOT in either runtime:", miss.join(", "));
console.log("\n@solidjs/web has:", [...wk].filter(x=>["Dynamic","dynamic","Portal","render","hydrate","spread"].includes(x)).join(", "));
