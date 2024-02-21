import { getEventClass } from './decorators/Event'
import { DidNotOccuredInAggregate } from './errors/DidNotOccuredInAggregate'
import { EventNotDefined } from './errors/EventNotDefined'
import { NotDecoratedEvent } from './errors/NotDecoratedEvent'
import type {
  AggregateId,
  EventAggregate,
  EventPayload,
  IAggregate,
  IEvent,
} from './types'

const factory = Symbol('createEvent')

interface IEventData<PayloadType> {
  aggregateId: any
  aggregateType: string
  eventType: string
  version: number
  occuredAt: number
  payload: PayloadType
}

export const createEvent = <EventType extends BaseEvent<any, any>>(
  data: IEventData<EventPayload<EventType>>,
) => {
  const EventClass = getEventClass(data.eventType)
  const event = new EventClass(data.payload) as EventType
  event[factory](data)

  return event
}

export abstract class BaseEvent<
  AggregateType extends IAggregate<any>,
  PayloadType,
> implements IEvent<AggregateType, PayloadType>
{
  #aggregateType?: string
  #aggregateId?: AggregateId<AggregateType>
  #version: number = 0
  #occuredAt: number;

  [factory](data: IEventData<PayloadType>) {
    const { aggregateId, aggregateType, occuredAt, version } = data
    this.#aggregateId = aggregateId
    this.#aggregateType = aggregateType
    this.#occuredAt = occuredAt
    this.#version = version
  }

  constructor(public readonly payload: PayloadType) {
    this.#occuredAt = Date.now()
  }

  get aggregateType(): string {
    if (!this.#aggregateType) {
      throw new DidNotOccuredInAggregate()
    }

    return this.#aggregateType
  }

  get version(): number {
    if (this.#version === 0) {
      throw new DidNotOccuredInAggregate()
    }

    return this.#version
  }

  get occuredAt(): number {
    return this.#occuredAt
  }

  get aggregateId(): AggregateId<AggregateType> {
    if (!this.#aggregateId) {
      throw new DidNotOccuredInAggregate()
    }

    return this.#aggregateId
  }

  get type(): string {
    throw new NotDecoratedEvent()
  }

  static get TYPE(): string {
    throw new NotDecoratedEvent()
  }

  /**
   * @internal
   */
  occuredIn(aggregate: AggregateType) {
    this.#aggregateId = aggregate.aggregateId
    this.#aggregateType = aggregate.type
    this.#version = aggregate.version
  }
}
