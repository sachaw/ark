import type { Accessor, Context } from "solid-js";
import type { JSX } from "@solidjs/web";
import { merge, omit, createMemo, onSettled, createEffect, untrack, createUniqueId, Show, For, children, createContext, useContext, onCleanup, createSignal } from "solid-js";
import { Dynamic, Portal, render } from "@solidjs/web";

type El = keyof JSX.IntrinsicElements;
const _a: Accessor<number> = () => 1;
type _P = JSX.HTMLAttributes<HTMLDivElement>;
type _I = JSX.IntrinsicElements["div"];
const _c: Context<number> | null = null;
// ComponentProps / ParentProps probe
type _CP = JSX.IntrinsicElements["button"];
export { merge, omit, createMemo, onSettled, createEffect, untrack, createUniqueId, Show, For, children, createContext, useContext, onCleanup, createSignal, Dynamic, Portal, render, _a, _c };
