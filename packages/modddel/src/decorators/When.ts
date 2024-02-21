import type { EventConstructor, IAggregate, IEvent } from '../types'

const eventHandlers = new WeakMap<any, Map<string, string>>()

export const getEventHandler = (target: any, eventType: string) => {
  const handlers = eventHandlers.get(target)
  if (!handlers) {
    return undefined
  }

  return handlers.get(eventType)
}

export const When = (
  Constructor: EventConstructor<IEvent<IAggregate<any>, any>>,
) => {
  return (target: any, propName: string) => {
    let handlers = eventHandlers.get(target.constructor)
    if (!handlers) {
      handlers = new Map<string, string>()
      eventHandlers.set(target.constructor, handlers)
    }

    handlers.set(Constructor.TYPE, propName)
  }
}
