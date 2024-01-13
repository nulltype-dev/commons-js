const listeners = Symbol('listeners')

type ListenerMap = {
  [name: PropertyKey]: unknown[]
}

export type Unsubscribe = () => void

export type AnyListener = (...args: unknown[]) => Promise<void> | void

type ListenerCollection<ListenerMapType> = Partial<
  Record<keyof ListenerMapType, AnyListener[]>
>

export class EventEmitter<ListenerMapType extends ListenerMap> {
  private [listeners]: ListenerCollection<ListenerMapType> = {}

  async emit<NameType extends keyof ListenerMapType>(
    name: NameType,
    ...args: ListenerMapType[NameType]
  ): Promise<void> {
    await Promise.all(
      (this[listeners][name] ?? []).map((listener) => listener(...args)),
    )
  }

  subscribe<NameType extends keyof ListenerMapType>(
    name: NameType,
    listener: (...args: ListenerMapType[NameType]) => void,
  ): Unsubscribe {
    const listenerList = this[listeners][name] ?? []

    this[listeners][name] ??= []
    this[listeners][name]!.push(listener as AnyListener)

    return () => {
      this[listeners][name] = this[listeners][name]!.filter(
        (l) => l !== listener,
      )
    }
  }
}
