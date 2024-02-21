import { AlreadyDefined } from '../errors/AlreadyDefined'
import { EventNotDefined } from '../errors/EventNotDefined'
import type { EventConstructor, IEvent } from '../types'

type AnyEventConstructor = EventConstructor<IEvent<any, any>>

const events = new Map<string, AnyEventConstructor>()

export const Event = (eventType: string) => {
  if (events.has(eventType)) {
    throw new AlreadyDefined(`Event "${eventType}"`)
  }

  return <ContructorType extends AnyEventConstructor>(
    Constructor: ContructorType,
  ) => {
    class EventClass extends Constructor {
      static get TYPE() {
        return eventType
      }

      get type() {
        return eventType
      }
    }

    events.set(eventType, EventClass)

    return EventClass
  }
}

export const getEventClass = (eventType: string): AnyEventConstructor => {
  const EventClass = events.get(eventType)
  if (!EventClass) {
    throw new EventNotDefined(eventType)
  }

  return EventClass
}
