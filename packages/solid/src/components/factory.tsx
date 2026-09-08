import { mergeProps } from '@zag-js/solid'
import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'
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
export type HTMLProps<E extends ElementType> = JSX.IntrinsicElements[E]
// 2.0: `ComponentProps` is gone; the intrinsic-element map is the direct
// equivalent for the element names this factory is keyed on.
//
// NOTE: 2.0 also widened every attribute to `T | RemoveAttribute`
// (`undefined | false`), which no longer matches ark's / zag's narrow
// `id?: string`. That is the remaining ~108-error class and it is NOT a
// one-line narrowing: stripping `false` wholesale also destroys genuine
// boolean attributes (`disabled?: boolean` -> `true`), which made it worse
// (155 -> 644 errors). Needs a per-attribute-aware fix.
export type HTMLArkProps<E extends ElementType> = Assign<JSX.IntrinsicElements[E], PolymorphicProps<E>>

type ArkComponent<E extends ElementType> = (props: HTMLArkProps<E>) => JSX.Element

const withAsProp = <T extends ElementType>(Component: T) => {
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
    return <Dynamic component={Component} {...parentProps} />
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
