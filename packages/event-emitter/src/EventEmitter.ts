type ListenerMap = {
  [name: PropertyKey]: unknown[]
}

export type Unsubscribe = () => void

export type AnyListener = (...args: unknown[]) => Promise<void> | void

type ListenerCollection<ListenerMapType> = Partial<
  Record<keyof ListenerMapType, AnyListener[]>
>

export interface EventSubscriber<ListenerMapType extends ListenerMap> {
  subscribe<NameType extends keyof ListenerMapType>(
    name: NameType,
    listener: (...args: ListenerMapType[NameType]) => void | Promise<void>,
  ): Unsubscribe
}

export class EventEmitter<ListenerMapType extends ListenerMap> {
  #listeners: ListenerCollection<ListenerMapType> = {}

  async emit<NameType extends keyof ListenerMapType>(
    name: NameType,
    ...args: ListenerMapType[NameType]
  ): Promise<void> {
    await Promise.all(
      (this.#listeners[name] ?? []).map((listener) => listener(...args)),
    )
  }

  subscribe<NameType extends keyof ListenerMapType>(
    name: NameType,
    listener: (...args: ListenerMapType[NameType]) => Promise<void> | void,
  ): Unsubscribe {
    this.#listeners[name] ??= []
    this.#listeners[name]!.push(listener as AnyListener)

    return () => {
      this.#listeners[name] = this.#listeners[name]!.filter(
        (l) => l !== listener,
      )
    }
  }

  getSubscriber(): EventSubscriber<ListenerMapType> {
    return {
      subscribe: <NameType extends keyof ListenerMapType>(
        name: NameType,
        listener: (...args: ListenerMapType[NameType]) => Promise<void> | void,
      ) => {
        return this.subscribe(name, listener)
      },
    }
  }
}
