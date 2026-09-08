import type { ParentProps, Ref } from 'solid-js';
import type { JSX, ComponentProps, ValidComponent } from '@solidjs/web';
import type { OverlayScrollbars, PartialOptions, EventListeners } from 'overlayscrollbars';
type InferGenericElement<T> = T extends keyof JSX.HTMLAttributes<infer G> ? G : HTMLElement;
export type OverlayScrollbarsComponentProps<T extends ValidComponent = 'div'> = Omit<ComponentProps<T>, 'ref'> & ParentProps<{
    /** Tag of the root element. */
    element?: T;
    /** OverlayScrollbars options. */
    options?: PartialOptions | false | null;
    /** OverlayScrollbars events. */
    events?: EventListeners | false | null;
    /** Whether to defer the initialization to a point in time when the browser is idle. (or to the next frame if `window.requestIdleCallback` is not supported) */
    defer?: boolean | IdleRequestOptions;
    /** OverlayScrollbarsComponent ref. */
    ref?: Ref<OverlayScrollbarsComponentRef<T>>;
}>;
export interface OverlayScrollbarsComponentRef<T extends ValidComponent = 'div'> {
    /** Returns the OverlayScrollbars instance or null if not initialized. */
    osInstance(): OverlayScrollbars | null;
    /** Returns the root element. */
    getElement(): InferGenericElement<T> | null;
}
export declare const OverlayScrollbarsComponent: <T extends ValidComponent = "div">(props: OverlayScrollbarsComponentProps<T>) => JSX.Element;
export {};
