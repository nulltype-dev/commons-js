import { simpleCopy } from '@nulltype/object-helper'
import { NotDecoratedAggregate } from './errors/NotDecoratedAggregate'
import type { AggregateId, AnyEvent, IAggregate, IEvent } from './types'
import { versionProp } from './decorators/Aggregate'

export abstract class BaseAggregate<IdType = string>
  implements IAggregate<IdType>
{
  public [versionProp]: number = 0
  #aggregateId: IdType

  public constructor(aggregateId: IdType) {
    this.#aggregateId = aggregateId
  }

  public static get TYPE(): string {
    throw new NotDecoratedAggregate()
  }

  public get aggregateId(): IdType {
    return this.#aggregateId
  }

  public get version(): number {
    return this[versionProp]
  }

  public get type(): string {
    throw new NotDecoratedAggregate()
  }

  protected recordThat(event: AnyEvent): void {
    throw new NotDecoratedAggregate()
  }
}
