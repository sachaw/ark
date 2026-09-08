import { createRenderEffect, onCleanup } from 'solid-js';
import { OverlayScrollbars } from 'overlayscrollbars';
const createDefer = () => {
    /* c8 ignore start */
    if (typeof window === 'undefined') {
        // mock ssr calls with "noop"
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const noop = () => { };
        return [noop, noop];
    }
    /* c8 ignore end */
    let idleId;
    let rafId;
    const wnd = window;
    const idleSupported = typeof wnd.requestIdleCallback === 'function';
    const rAF = wnd.requestAnimationFrame;
    const cAF = wnd.cancelAnimationFrame;
    const rIdle = idleSupported ? wnd.requestIdleCallback : rAF;
    const cIdle = idleSupported ? wnd.cancelIdleCallback : cAF;
    const clear = () => {
        cIdle(idleId);
        cAF(rafId);
    };
    return [
        (callback, options) => {
            clear();
            idleId = rIdle(idleSupported
                ? () => {
                    clear();
                    // inside idle its best practice to use rAF to change DOM for best performance
                    rafId = rAF(callback);
                }
                : callback, typeof options === 'object' ? options : { timeout: 2233 });
        },
        clear,
    ];
};
const isAccessor = (obj) => typeof obj === 'function';
const unwrapAccessor = (obj) => (isAccessor(obj) ? obj() : obj);
export const createOverlayScrollbars = (params) => {
    let instance = null;
    let options;
    let events;
    let defer;
    const [requestDefer, clearDefer] = createDefer();
    // 2.0: createRenderEffect takes (compute, apply). The compute does the
    // reactive read; the apply writes the captured value and touches the
    // instance.
    createRenderEffect(() => unwrapAccessor(unwrapAccessor(params)?.defer), (value) => {
        defer = value;
    });
    createRenderEffect(() => unwrapAccessor(unwrapAccessor(params)?.options), (value) => {
        options = value;
        if (OverlayScrollbars.valid(instance)) {
            instance.options(options || {}, true);
        }
    });
    createRenderEffect(() => unwrapAccessor(unwrapAccessor(params)?.events), (value) => {
        events = value;
        if (OverlayScrollbars.valid(instance)) {
            instance.on(events || {}, true);
        }
    });
    onCleanup(() => {
        clearDefer();
        instance?.destroy();
    });
    return [
        (target) => {
            // if already initialized do nothing
            if (OverlayScrollbars.valid(instance)) {
                return instance;
            }
            const init = () => (instance = OverlayScrollbars(target, options || {}, events || {}));
            if (defer) {
                requestDefer(init, defer);
            }
            else {
                init();
            }
        },
        () => instance,
    ];
};
