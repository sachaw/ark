import type {
  ActionsOrFn,
  BindableContext,
  ChooseFn,
  ComputedFn,
  EffectParams,
  EffectRecord,
  EffectsOrFn,
  GuardFn,
  InputProps,
  Machine,
  MachineSchema,
  Params,
  Service,
} from "@zag-js/core"
import {
  createReplaceTracker,
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  isWatchEffect,
  MachineStatus,
  matchesState,
  resolveStateValue,
  watchEffect,
} from "@zag-js/core"
import { compact, ensure, isEqual, isFunction, isString, toArray, warn } from "@zag-js/utils"
import { type Accessor, createEffect, createMemo, createSignal, flush as flushSolid, merge, onSettled, untrack } from "solid-js"
import { createBindable } from "./bindable.ts"
import { createRefs } from "./refs.ts"
import { createTrack } from "./track.ts"

export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps: InputProps<T> | Accessor<InputProps<T>> = {} as InputProps<T>,
): Service<T> {
  const scope = createMemo(() => {
    const { id, ids, getRootNode } = access(userProps) as any
    return createScope({ id, ids, getRootNode })
  })

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args)
  }

  const props = createMemo(
    () =>
      machine.props?.({
        props: compact(access(userProps)),
        scope: scope(),
      }) ?? access(userProps),
  )

  const prop: any = createProp(props)

  // Seeding is a ONE-SHOT read, and 2.0 warns (STRICT_READ_UNTRACKED) when a
  // reactive value is read outside a tracking scope because it "will not
  // update" — which is exactly the intent here: these are initial values, and
  // the machine tracks subsequent changes through its own bindables. Reading
  // them untracked states that intent instead of tripping the diagnostic.
  // `prop` itself stays tracking, because `computed` genuinely depends on it.
  const context: any = untrack(() => machine.context?.({
    prop,
    bindable: createBindable,
    get scope() {
      return scope()
    },
    flush,
    getContext() {
      return ctx as any
    },
    getComputed() {
      return computed as any
    },
    getRefs() {
      return refs as any
    },
    getEvent() {
      return getEvent()
    },
  }))

  const ctx: BindableContext<T> = {
    get(key) {
      return context?.[key].get()
    },
    set(key, value) {
      context?.[key].set(value)
    },
    initial(key) {
      return context?.[key].initial
    },
    hash(key) {
      const current = context?.[key].get()
      return context?.[key].hash(current)
    },
  }

  const effects = { current: new Map<number, EffectRecord>() }
  let effectId = 0
  // Solid does not re-render, so a version bump re-collects the watched deps when the effect set changes;
  // transitions write it, and they can run inside a computation.
  const [effectsVersion, setEffectsVersion] = createSignal(0, { ownedWrite: true })
  const notify = () => setEffectsVersion((n) => n + 1)
  const transitionRef: { current: any } = { current: null }

  const previousEventRef: { current: any } = { current: null }
  const eventRef: { current: any } = { current: { type: "" } }

  const getEvent = (): any =>
    merge(eventRef.current, {
      current() {
        return eventRef.current
      },
      previous() {
        return previousEventRef.current
      },
    })

  const getState = () =>
    merge(state, {
      matches(...values: T["state"][]) {
        const current = state.get()
        return values.some((value) => matchesState(current as string, value as string))
      },
      hasTag(tag: T["tag"]) {
        const current = state.get()
        return hasTag(machine, current, tag)
      },
    })

  const refs = createRefs(untrack(() => machine.refs?.({ prop, context: ctx })) ?? {})

  const getParams = (): Params<T> => ({
    state: getState(),
    context: ctx,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track: createTrack,
    refs,
    computed,
    flush,
    get scope() {
      return scope()
    },
    choose,
  })

  const action = (keys: ActionsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys
    if (!strs) return
    const fns = strs.map((s) => {
      const fn = machine.implementations?.actions?.[s]
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`)
      return fn
    })
    for (const fn of fns) {
      fn?.(getParams())
    }
  }

  const guard = (str: T["guard"] | GuardFn<T>) => {
    if (isFunction(str)) return str(getParams())
    const fn = machine.implementations?.guards?.[str]
    if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`)
    return fn?.(getParams())
  }

  const startEffects = (path: string, keys: EffectsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys
    if (!strs) return

    for (const name of strs) {
      const fn = machine.implementations?.effects?.[name]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(name)}"`)
        continue
      }

      const result = fn({ ...getParams(), watchEffect } as EffectParams<T>)

      // one record per invocation, so a re-entered path keeps every setup's own cleanup
      const id = ++effectId
      const record: EffectRecord = { id, path, cleanup: undefined }

      if (isWatchEffect(result)) {
        record.deps = result.deps
        record.setup = result.setup
        const cleanup = result.setup()
        record.cleanup = isFunction(cleanup) ? cleanup : undefined
        // snapshot after setup, so a dep that setup itself touches cannot loop
        record.values = untrack(() => result.deps.map((d) => d()))
      } else if (isFunction(result)) {
        record.cleanup = result
      }

      effects.current.set(id, record)
    }

    notify()
  }

  const stopEffects = (path: string) => {
    for (const [id, record] of effects.current) {
      if (record.path !== path) continue
      record.cleanup?.("exit")
      effects.current.delete(id)
    }
    notify()
  }

  const reconcileEffects = (watched: Map<number, unknown[]>) => {
    if (status !== MachineStatus.Started) return

    let stale: EffectRecord[] | undefined

    for (const [id, next] of watched) {
      const record = effects.current.get(id)
      if (!record) continue
      if (!next.some((value, index) => !isEqual(record.values![index], value))) continue
      record.values = next
      // setup() reads live values, so an already-queued restart covers this change too
      if (record.pending) continue
      record.pending = true
      ;(stale ??= []).push(record)
    }

    if (!stale) return

    queueMicrotask(() => {
      for (const record of stale) {
        record.pending = false
        if (!effects.current.has(record.id)) continue
        record.cleanup?.("restart")
        const cleanup = untrack(() => record.setup!())
        record.cleanup = isFunction(cleanup) ? cleanup : undefined
      }
    })
  }

  const choose: ChooseFn<T> = (transitions) => {
    return toArray(transitions).find((t) => {
      let result = !t.guard
      if (isString(t.guard)) result = !!guard(t.guard)
      else if (isFunction(t.guard)) result = t.guard(getParams())
      return result
    })
  }

  const computed: ComputedFn<T> = (key) => {
    ensure(machine.computed, () => `[zag-js] No computed object found on machine`)
    const fn = machine.computed[key]
    return fn({
      context: ctx,
      event: eventRef.current,
      prop,
      refs,
      scope: scope(),
      computed: computed,
    })
  }

  const state = createBindable(() => ({
    defaultValue: untrack(() => resolveStateValue(machine, machine.initialState({ prop }))),
    onChange(nextState, prevState) {
      const { exiting, entering } = getExitEnterStates(machine, prevState, nextState, transitionRef.current?.reenter)

      exiting.forEach((item) => {
        stopEffects(item.path)
      })

      exiting.forEach((item) => {
        action(item.state?.exit)
      })

      action(transitionRef.current?.actions)

      entering.forEach((item) => {
        startEffects(item.path, item.state?.effects)
      })

      if (prevState === INIT_STATE) {
        action(machine.entry)
        startEffects(INIT_STATE, machine.effects)
      }

      entering.forEach((item) => {
        action(item.state?.entry)
      })
    },
  }))

  let status = MachineStatus.NotStarted

  // 2.0: `onSettled` replaces `onMount`, and the function it returns is the
  // cleanup — so mount/unmount collapse into one lifecycle registration.
  onSettled(() => {
    const started = status === MachineStatus.Started
    status = MachineStatus.Started
    debug(started ? "rehydrating..." : "initializing...")
    state.invoke(state.initial!, INIT_STATE)

    return () => {
      if (status !== MachineStatus.Started) return

      debug("unmounting...")
      status = MachineStatus.Stopped

      effects.current.forEach((record) => record.cleanup?.("exit"))
      effects.current = new Map()
      transitionRef.current = null

      action(machine.exit)
    }
  })

  const replaceTracker = createReplaceTracker()

  const send = (event: any) => {
    const key = event.replaces
    const token = key ? replaceTracker.claim(key) : undefined
    queueMicrotask(() => {
      if (key && token && replaceTracker.isReplaced(key, token)) return
      if (status !== MachineStatus.Started) return

      previousEventRef.current = eventRef.current
      eventRef.current = event

      let currentState = untrack(() => state.get())

      const { transitions, source } = findTransition(machine, currentState, event.type as string)
      const transition = choose(transitions)
      if (!transition) return

      // save current transition
      transitionRef.current = transition
      const target = resolveStateValue(machine, transition.target ?? currentState, source)

      debug("transition", event.type, transition.target || currentState, `(${transition.actions})`)

      const changed = target !== currentState
      if (changed) {
        // state change is high priority
        state.set(target)
      } else if (transition.reenter) {
        // reenter will re-invoke the current state
        state.invoke(currentState, currentState)
      } else {
        // call transition actions
        action(transition.actions)
      }
    })
  }

  machine.watch?.(getParams())

  // The watched deps are read in the tracked half, the restarts happen in the untracked one.
  createEffect(
    () => {
      effectsVersion()
      const watched = new Map<number, unknown[]>()
      for (const record of effects.current.values()) {
        if (record.deps) watched.set(record.id, record.deps.map((d) => d()))
      }
      return watched
    },
    reconcileEffects,
  )

  return {
    state: getState(),
    send,
    context: ctx,
    prop,
    get scope() {
      return scope()
    },
    refs,
    computed,
    event: getEvent(),
    getStatus: () => status,
  } as unknown as Service<T>
}

function flush(fn: VoidFunction) {
  // Under 1.x signal writes were visible immediately, so this was a bare
  // passthrough. Solid 2 defers commit to the microtask.
  //
  // Machine reads are already synchronous (bindable keeps an authoritative
  // shadow cell), so the drain here only pulls *rendering* forward. Inside a
  // computation the drain is already in progress and calling flush() is a
  // warned no-op, so defer it instead of forcing one inline.
  //
  // Always defer: an effect's *apply* phase runs untracked, so there is no
  // observer to detect the in-progress drain from, and calling flush() there
  // is a warned no-op. Deferring is correct in both cases.
  fn()
  queueMicrotask(() => flushSolid())
}

function access<T>(value: T | Accessor<T>) {
  return isFunction(value) ? value() : value
}

function createProp<T>(value: Accessor<T>) {
  return function get<K extends keyof T>(key: K): T[K] {
    return value()[key]
  }
}
