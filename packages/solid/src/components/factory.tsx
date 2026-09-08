import { mergeProps } from '@zag-js/solid'
import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { dynamic } from '@solidjs/web'
import type { Assign } from '../types.ts'

type ElementType = keyof JSX.IntrinsicElements

type JsxElements = {
  [E in ElementType]: ArkComponent<E>
}

type ParentProps<T extends ElementType> = (userProps?: JSX.IntrinsicElements[T]) => JSX.HTMLAttributes<any>

export type PolymorphicProps<T extends ElementType> = {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: (props: ParentProps<T>) => JSX.Element
}
/**
 * 2.0 widened every JSX attribute to `T | RemoveAttribute` (`undefined | false`)
 * so a binding can express attribute removal. Ark's prop interfaces `extends`
 * both this and zag's machine props, and interface extension demands the shared
 * members be *identical* — but zag declares the narrow `id?: string`. Result:
 * every component root failed to extend both (TS2320) and to forward its props
 * into its machine (TS2345).
 *
 * Strip the removal sentinel, but only where it is genuinely an addition: if the
 * attribute already admits `boolean` then `false` is a real value and must stay
 * (dropping it turns `disabled?: boolean` into `true`). JSX call sites are
 * unaffected — they still accept `false`/`undefined` via the element's own type.
 */
// `BooleanAttribute` is `boolean | ""` (the HTML empty-string form), so a
// boolean-valued attribute also picks up `""` that zag's props don't have.
// Strip whichever sentinel this attribute gained: `""` for boolean-valued
// attributes, `false` for everything else.
type NarrowAttr<V> = boolean extends V ? Exclude<V, ''> : Exclude<V, false>

export type HTMLProps<E extends ElementType> = {
  [K in keyof JSX.IntrinsicElements[E]]: NarrowAttr<JSX.IntrinsicElements[E][K]>
}

// 2.0: `ComponentProps` is gone; the intrinsic-element map is the direct
// equivalent for the element names this factory is keyed on.
export type HTMLArkProps<E extends ElementType> = Assign<HTMLProps<E>, PolymorphicProps<E>>

type ArkComponent<E extends ElementType> = (props: HTMLArkProps<E>) => JSX.Element

const withAsProp = <T extends ElementType>(Component: T) => {
  // 2.0 has two dynamic forms and the difference is load-bearing here: the
  // `<Dynamic component={...}>` JSX wrapper RE-CREATES its host element when
  // props change, while the `dynamic()` factory keeps a stable component
  // identity and patches in place. Re-creation detaches the node, so anything
  // holding a reference loses it — focus is dropped, animations restart, and
  // every `getByRole(...)`-then-assert test fails against a stale node.
  //
  // `withAsProp` is memoised per element name by `jsxFactory`, so this runs
  // once per tag.
  const Rendered = dynamic(() => Component)

  const ArkComponent: ArkComponent<T> = (props) => {
    // 2.0: `splitProps` is replaced by `omit`, which is variadic and returns
    // ONLY the rest. The "local" half is just read off `props` directly —
    // props stay reactive, so no extraction is needed.
    const parentProps = omit(props, 'asChild')

    if (props.asChild) {
      // @ts-expect-error
      const propsFn = (userProps) => mergeProps(omit(parentProps, 'ref'), userProps)
      return props.asChild(propsFn)
    }
    // @ts-expect-error
    return <Rendered {...parentProps} />
  }

  return ArkComponent
}

function jsxFactory() {
  const cache = new Map()

  return new Proxy(withAsProp, {
    apply(_target, _thisArg, argArray) {
      return withAsProp(argArray[0])
    },
    get(_, element) {
      const asElement = element as ElementType
      if (!cache.has(asElement)) {
        cache.set(asElement, withAsProp(asElement))
      }
      return cache.get(asElement)
    },
  }) as unknown as JsxElements
}

export const ark = jsxFactory()
