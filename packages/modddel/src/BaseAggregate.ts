import { aggregateVersion } from './decorators/Aggregate'
import { NotDecoratedAggregate } from './errors/NotDecoratedAggregate'
import type { AnyEvent, IAggregate } from './types'

export abstract class BaseAggregate<IdType = string>
  implements IAggregate<IdType>
{
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
    return aggregateVersion(this).get()
  }

  public get type(): string {
    throw new NotDecoratedAggregate()
  }

  protected recordThat(event: AnyEvent): void {
    throw new NotDecoratedAggregate()
  }
}
