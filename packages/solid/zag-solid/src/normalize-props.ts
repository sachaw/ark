import { createNormalizer } from "@zag-js/types"
import { isNumber, isObject, isString } from "@zag-js/utils"
import type { JSX } from "@solidjs/web"

/**
 * 2.0 widened every JSX attribute to `T | RemoveAttribute` (`undefined | false`).
 * zag's own machine props and ark's prop interfaces both declare the narrow
 * form, so the props this normalizer emits must be narrowed to match or every
 * spread into an ark component mismatches on `id` / `aria-*`. Only strip the
 * sentinel where it is an addition — attributes that genuinely admit `boolean`
 * keep `false` as a real value.
 */
// `BooleanAttribute` is `boolean | ""` (the HTML empty-string form), so a
// boolean-valued attribute also picks up `""` that zag's props don't have.
// Strip whichever sentinel this attribute gained: `""` for boolean-valued
// attributes, `false` for everything else.
type NarrowAttr<V> = boolean extends V ? Exclude<V, ''> : Exclude<V, false>
type Narrow<T> = { [K in keyof T]: NarrowAttr<T[K]> }

export type PropTypes = {
  [E in keyof JSX.IntrinsicElements]: Narrow<JSX.IntrinsicElements[E]>
} & {
  element: Narrow<JSX.HTMLAttributes<any>>
  style: JSX.CSSProperties
}

const eventMap: Record<string, string> = {
  onFocus: "onFocusIn",
  onBlur: "onFocusOut",
  onDoubleClick: "onDblClick",
  onChange: "onInput",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  className: "class",
}

const format = (v: string) => (v.startsWith("--") ? v : hyphenateStyleName(v))

type StyleObject = Record<string, any>

function toSolidProp(prop: string) {
  return prop in eventMap ? eventMap[prop] : prop
}

type Dict = Record<string, any>

export const normalizeProps = createNormalizer<PropTypes>((props: Dict) => {
  const normalized: Dict = {}

  for (const key in props) {
    const value = props[key]

    if (key === "readOnly" && value === false) {
      continue
    }

    // 2.0 treats a boolean attribute value as presence/absence, so
    // `aria-hidden={true}` renders as `aria-hidden=""` — which the
    // accessibility tree does NOT read as hidden. ARIA attributes are always
    // strings; 2.0's own types now say so (`"true" | "false"`), and zag's
    // machines still emit real booleans. Stringify them here, in the adapter,
    // rather than patching every machine.
    if (key.startsWith("aria-") && typeof value === "boolean") {
      normalized[key] = value ? "true" : "false"
      continue
    }

    if (key === "style" && isObject(value)) {
      normalized["style"] = cssify(value)
      continue
    }

    if (key === "children") {
      if (isString(value)) {
        normalized["textContent"] = value
      }
      continue
    }

    normalized[toSolidProp(key)] = value
  }
  return normalized
})

function cssify(style: StyleObject): StyleObject {
  let css = {} as StyleObject
  for (const property in style) {
    const value = style[property]
    if (!isString(value) && !isNumber(value)) continue
    css[format(property)] = value
  }

  return css
}

const uppercasePattern = /[A-Z]/g
const msPattern = /^ms-/

function toHyphenLower(match: string) {
  return "-" + match.toLowerCase()
}

const cache: Record<string, any> = {}

function hyphenateStyleName(name: string) {
  if (cache.hasOwnProperty(name)) return cache[name]
  const hName = name.replace(uppercasePattern, toHyphenLower)
  return (cache[name] = msPattern.test(hName) ? "-" + hName : hName)
}
