import { AlreadyDefined } from '../errors/AlreadyDefined'
import { EventNotDefined } from '../errors/EventNotDefined'
import type {
  AnyEvent,
  EventConstructor,
  EventPayload,
  IAggregate,
  IEvent,
} from '../types'

type AnyEventConstructor = EventConstructor<IEvent<any, any>>

export interface ISerializedEvent<PayloadType> {
  aggregateId: any
  aggregateType: string
  eventType: string
  version: number
  occuredAt: number
  payload: PayloadType
}

interface IEventData<IdType> {
  aggregateId?: IdType
  aggregateType?: string
  version: number
  occuredAt: number
}

const events = new Map<string, AnyEventConstructor>()
const eventData = new WeakMap<IEvent<any, any>, IEventData<any>>()

export const getEventData = <IdType>(
  event: IEvent<IAggregate<IdType>, any>,
) => {
  let data = eventData.get(event)
  if (!data) {
    data = {
      aggregateId: undefined,
      aggregateType: undefined,
      occuredAt: 0,
      version: 0,
    }
    eventData.set(event, data)
  }

  return data
}

export const createEvent = <EventType extends IEvent<any, any>>(
  serializedData: ISerializedEvent<EventPayload<EventType>>,
) => {
  const { aggregateId, aggregateType, eventType, occuredAt, payload, version } =
    serializedData
  const EventClass = getEventClass(eventType)
  const event = new EventClass(payload) as EventType
  const data = getEventData(event)
  data.aggregateId = aggregateId
  data.aggregateType = aggregateType
  data.version = version
  data.occuredAt = occuredAt

  return event
}

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

export const serializeEvent = (event: AnyEvent): ISerializedEvent<any> => ({
  aggregateId: event.aggregateId,
  aggregateType: event.aggregateType,
  eventType: event.type,
  occuredAt: event.occuredAt,
  payload: event.payload,
  version: event.version,
})
