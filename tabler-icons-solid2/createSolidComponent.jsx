import defaultAttributes from './defaultAttributes'
import { omit } from 'solid-js'
import { Dynamic } from '@solidjs/web'

// Solid 2 port of @tabler/icons-solidjs's only Solid-coupled file.
//   - `splitProps` is removed in 2.0; `omit` returns ONLY the rest half, and
//     the "local" half is just read off `props` directly (props stay reactive).
//   - `solid-js/web` -> `@solidjs/web`.
//   - `class` takes the array/object form in 2.0 rather than a built string.
const createSolidComponent = (type, iconName, iconNamePascal, iconNode) => {
  const Component = (props) => {
    const rest = omit(props, 'color', 'size', 'stroke', 'strokeWidth', 'title', 'children', 'class')
    const attributes = defaultAttributes[type]
    const strokeValue = () => props.stroke ?? props.strokeWidth
    return (
      <svg
        {...attributes}
        {...rest}
        width={props.size != null ? props.size : attributes.width}
        height={props.size != null ? props.size : attributes.height}
        class={['tabler-icon', `tabler-icon-${iconName}`, props.class]}
        {...(type === 'filled'
          ? { fill: props.color != null ? props.color : 'currentColor' }
          : {
              stroke: props.color != null ? props.color : 'currentColor',
              'stroke-width': strokeValue() != null ? strokeValue() : attributes['stroke-width'],
            })}
      >
        {props.title != null && <title>{props.title}</title>}
        {iconNode.map(([tag, attrs]) => (
          <Dynamic component={tag} {...attrs} />
        ))}
        {props.children}
      </svg>
    )
  }
  Component.displayName = `${iconNamePascal}`
  return Component
}

export default createSolidComponent
