import { getEventData } from './decorators/Event'
import { DidNotOccuredInAggregate } from './errors/DidNotOccuredInAggregate'
import { NotDecoratedEvent } from './errors/NotDecoratedEvent'
import type { AggregateId, IAggregate, IEvent } from './types'

export abstract class BaseEvent<
  AggregateType extends IAggregate<any>,
  PayloadType,
> implements IEvent<AggregateType, PayloadType>
{
  constructor(public readonly payload: PayloadType) {
    getEventData(this).occuredAt = Date.now()
  }

  get aggregateType(): string {
    const type = getEventData(this).aggregateType
    if (!type) {
      throw new DidNotOccuredInAggregate()
    }

    return type
  }

  get version(): number {
    const version = getEventData(this).version
    if (!version) {
      throw new DidNotOccuredInAggregate()
    }

    return version
  }

  get occuredAt(): number {
    return getEventData(this).occuredAt
  }

  get aggregateId(): AggregateId<AggregateType> {
    const id = getEventData(this).aggregateId
    if (!id) {
      throw new DidNotOccuredInAggregate()
    }

    return id
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
    const data = getEventData(this)
    data.aggregateId = aggregate.aggregateId
    data.aggregateType = aggregate.type
    data.version = aggregate.version
  }
}
