import { mergeProps } from '@zag-js/solid'
import { warn } from '@zag-js/utils'
import { type Accessor, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { dynamic } from '@solidjs/web'
import type { Assign } from '../types.ts'

type ElementType = keyof JSX.IntrinsicElements

type JsxElements = {
  [E in ElementType]: ArkComponent<E>
}

export type EmptyState = Record<never, never>

// intentionally `any`: the props are spread onto arbitrary user components, `unknown` would break that
export type RenderProps = Record<string, any>

// call it to get the part's props, passing your own to merge them in
export type PropsFn<T extends ElementType> = (userProps?: JSX.IntrinsicElements[T]) => RenderProps

// the render fn runs once, so the state has to be an accessor
export type RenderFn<T extends ElementType, State> = (props: PropsFn<T>, state: Accessor<State>) => JSX.Element

export type PolymorphicProps<T extends ElementType, State = EmptyState> = {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   *
   * @deprecated Use `render` instead. It takes the same props function, plus the part's state.
   * `asChild` is still supported, but `render` is preferred.
   */
  asChild?: (props: PropsFn<T>) => JSX.Element
  /**
   * Render the part as a custom element, combining their props and behavior.
   *
   * Call `props()` to spread the part's props, passing your own to merge them rather than overwrite them.
   * The state arrives as an accessor:
   * `render={(props, state) => <button {...props({ onClick: mine })}>{state().open}</button>}`
   */
  render?: RenderFn<T, State>
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

/**
 * The state of the part, forwarded to the `render` function. Set by the component, not the consumer.
 */
interface StateProp {
  state?: unknown
}

interface FactoryProps extends Record<string, any> {
  asChild?: (props: PropsFn<any>) => JSX.Element
  render?: RenderFn<any, any>
  state?: unknown
}

// `any` for the state so a render fn can declare the shape its part provides
type ArkComponent<E extends ElementType> = (
  props: Assign<HTMLProps<E>, PolymorphicProps<E, any>> & StateProp,
) => JSX.Element

const EMPTY_STATE: EmptyState = Object.freeze({})

const withRender = <T extends ElementType>(Component: T) => {
  // 2.0 has two dynamic forms and the difference is load-bearing here: the
  // `<Dynamic component={...}>` JSX wrapper RE-CREATES its host element when
  // props change, while the `dynamic()` factory keeps a stable component
  // identity and patches in place. Re-creation detaches the node, so anything
  // holding a reference loses it — focus is dropped, animations restart, and
  // every `getByRole(...)`-then-assert test fails against a stale node.
  //
  // `withRender` is memoised per element name by `jsxFactory`, so this runs
  // once per tag.
  const Rendered = dynamic(() => Component)

  const ArkComponent: ArkComponent<T> = (props) => {
    const localProps = props as FactoryProps
    const parentProps = omit(localProps, 'asChild', 'render', 'state')

    warn(
      Boolean(localProps.asChild) && Boolean(localProps.render),
      '[ark-ui] `asChild` and `render` cannot be used together. Prefer `render`.',
    )

    if (localProps.render || localProps.asChild) {
      // the caller applies the props itself, so only the ref is left to us
      const restProps = omit(parentProps, 'ref')
      const propsFn = (userProps?: JSX.IntrinsicElements[T]) => mergeProps(restProps, userProps ?? {})
      if (localProps.render) return localProps.render(propsFn, () => localProps.state ?? EMPTY_STATE)
      return localProps.asChild!(propsFn)
    }

    // @ts-expect-error generic element props can't be expressed against Dynamic
    return <Rendered {...parentProps} />
  }

  return ArkComponent
}

function jsxFactory() {
  const cache = new Map()

  return new Proxy(withRender, {
    apply(_target, _thisArg, argArray) {
      return withRender(argArray[0])
    },
    get(_, element) {
      const asElement = element as ElementType
      if (!cache.has(asElement)) {
        cache.set(asElement, withRender(asElement))
      }
      return cache.get(asElement)
    },
  }) as unknown as JsxElements
}

export const ark = jsxFactory()
