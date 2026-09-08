import type { Accessor } from 'solid-js';
import type { Store } from 'solid-js';
import type { InitializationTarget } from 'overlayscrollbars';
import type { OverlayScrollbarsComponentProps, OverlayScrollbarsComponentRef } from './OverlayScrollbarsComponent';
export interface CreateOverlayScrollbarsParams {
    /** OverlayScrollbars options. */
    options?: OverlayScrollbarsComponentProps['options'] | Accessor<OverlayScrollbarsComponentProps['options']>;
    /** OverlayScrollbars events. */
    events?: OverlayScrollbarsComponentProps['events'] | Accessor<OverlayScrollbarsComponentProps['events']>;
    /** Whether to defer the initialization to a point in time when the browser is idle. (or to the next frame if `window.requestIdleCallback` is not supported) */
    defer?: OverlayScrollbarsComponentProps['defer'] | Accessor<OverlayScrollbarsComponentProps['defer']>;
}
export type CreateOverlayScrollbarsInitialization = (target: InitializationTarget) => void;
export type CreateOverlayScrollbarsInstance = () => ReturnType<OverlayScrollbarsComponentRef['osInstance']>;
export declare const createOverlayScrollbars: (params?: CreateOverlayScrollbarsParams | Accessor<CreateOverlayScrollbarsParams | undefined> | Store<CreateOverlayScrollbarsParams | undefined>) => [CreateOverlayScrollbarsInitialization, CreateOverlayScrollbarsInstance];
