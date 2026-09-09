import { omit } from 'solid-js'
import { pickProps } from './pick-props.ts'

type EnsureKeys<ExpectedKeys extends (keyof Target)[], Target> = keyof Target extends ExpectedKeys[number]
  ? unknown
  : `Missing required keys: ${Exclude<keyof Target, ExpectedKeys[number]> & string}`

/**
 * Divide a props object into the keys a zag machine takes and everything else.
 *
 * Both halves are genuinely needed as objects — the first is passed to the
 * machine, the second is spread onto the element — so this is a pick plus a
 * native `omit`, not a port of 1.x `splitProps`. The curried form exists for
 * `EnsureKeys`, which fails the build if the machine grows a prop that a call
 * site does not list.
 */
export const createSplitProps =
  <Target extends Record<never, never>>() =>
  <Keys extends (keyof Target)[], Props extends Target = Target>(
    props: Props,
    keys: Keys & EnsureKeys<Keys, Target>,
  ): [Pick<Props, Keys[number]>, Omit<Props, Keys[number]>] => [
    pickProps(props, keys as unknown as readonly (keyof Props)[]) as Pick<Props, Keys[number]>,
    omit(props as Record<string, unknown>, ...(keys as readonly string[])) as unknown as Omit<Props, Keys[number]>,
  ]
