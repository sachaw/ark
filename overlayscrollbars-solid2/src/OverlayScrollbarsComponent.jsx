import { merge, omit, children, createEffect, createRenderEffect, createSignal } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import { createOverlayScrollbars } from './createOverlayScrollbars';

const OWN_KEYS = ['element', 'options', 'events', 'defer', 'ref', 'children'];

export const OverlayScrollbarsComponent = (props) => {
    // 2.0: `mergeProps` -> `merge`, `splitProps` -> `omit`. `omit` returns ONLY
    // the rest half, and the "local" half is read straight off the merged props
    // (they stay reactive), so there is no second tuple slot.
    //
    // NOTE: 2.0's `merge` treats an explicit `undefined` as a real overriding
    // value, unlike 1.x `mergeProps` which skipped it. An absent `element` key
    // is still fine (the default wins); an explicit `element={undefined}` would
    // now clobber the 'div' default, so the fallback is applied at the use site.
    const finalProps = merge({ element: 'div' }, props);
    const other = omit(finalProps, ...OWN_KEYS);
    const element = () => finalProps.element ?? 'div';

    const [elementRef, setElementRef] = createSignal();
    const [childrenRef, setChildrenRef] = createSignal();
    const [initialize, instance] = createOverlayScrollbars(finalProps);
    // https://github.com/KingSora/OverlayScrollbars/issues/700
    // use the children helper outside of jsx: https://docs.solidjs.com/reference/component-apis/children
    const resolvedChildren = children(() => finalProps.children);

    // 2.0: two-arg effect. The compute gathers the tracked reads; the apply
    // does the imperative work and RETURNS the cleanup (onCleanup is not
    // allowed inside an effect callback here).
    createEffect(
        () => ({ target: elementRef(), contentsElement: childrenRef(), el: element() }),
        ({ target, contentsElement, el }) => {
            /* c8 ignore start */
            if (!target) {
                return;
            }
            /* c8 ignore end */
            initialize(el === 'body'
                ? {
                    target,
                    cancel: {
                        body: null,
                    },
                }
                : {
                    target,
                    elements: {
                        viewport: contentsElement,
                        content: contentsElement,
                    },
                });
            return () => {
                instance()?.destroy();
            };
        });

    createRenderEffect(
        () => finalProps.ref,
        (refProp) => {
            const ref = {
                osInstance: instance,
                getElement: () =>
                    /* c8 ignore next */
                    elementRef() || null,
            };
            // 2.0: refs are always functions — the 1.x `finalProps.ref = ref`
            // object-ref branch is gone, and assigning to a props proxy would
            // throw anyway.
            if (typeof refProp === 'function') {
                refProp(ref);
            }
        });

    return (<Dynamic component={element()} data-overlayscrollbars-initialize="" ref={setElementRef} {...other}>
      {element() === 'body' ? (resolvedChildren()) : (<div data-overlayscrollbars-contents="" ref={setChildrenRef}>
          {resolvedChildren()}
        </div>)}
    </Dynamic>);
};
