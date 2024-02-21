import type { ISnapshot } from './AggregateSnapshot'
import { createFromSnapshot, toSnapshot } from './AggregateSnapshot'
import type { BaseAggregate } from './BaseAggregate'
import {
  asReplayableAggregate,
  getAggregateClass,
  popEvents,
} from './decorators/Aggregate'
import {
  serializeEvent,
  type ISerializedEvent,
  createEvent,
} from './decorators/Event'
import type { AggregateId, AnyEvent, IAggregate } from './types'

export interface ISnapshotStorage {
  shouldCreateSnapshot<AggregateType extends IAggregate<any>>(
    aggregate: AggregateType,
  ): Promise<boolean>
  save(snapshot: ISnapshot<any, any>): Promise<void>
  load<IdType>(
    aggregateType: string,
    aggregateId: IdType,
  ): Promise<ISnapshot<IdType, any> | undefined>
}

export interface IEventStorage {
  save(events: ISerializedEvent<any>[]): Promise<void>
  load<IdType>(
    aggregateType: string,
    aggregateId: IdType,
    sinceVersion: number,
  ): Promise<ISerializedEvent<any>[]>
}

interface RepositoryOptions {
  snapshotStorage?: ISnapshotStorage
  eventStorage?: IEventStorage
}

export class Repository {
  constructor(private options: RepositoryOptions) {}

  async save(aggregate: IAggregate<any>): Promise<void> {
    const { snapshotStorage, eventStorage } = this.options

    const events = popEvents(aggregate).map(serializeEvent)
    if (!events.length) {
      return
    }

    if (eventStorage) {
      await eventStorage.save(events)
    }

    if (
      snapshotStorage &&
      (await snapshotStorage.shouldCreateSnapshot(aggregate))
    ) {
      const snapshot = toSnapshot(aggregate)
      await snapshotStorage.save(snapshot)
    }
  }

  async load<AggregateType extends BaseAggregate<any>>(
    aggregateType: string,
    aggregateId: AggregateId<AggregateType>,
  ): Promise<AggregateType | undefined> {
    let aggregate: AggregateType | undefined = undefined
    const { snapshotStorage, eventStorage } = this.options

    if (snapshotStorage) {
      const snapshot = await snapshotStorage.load<AggregateId<AggregateType>>(
        aggregateType,
        aggregateId,
      )

      if (snapshot) {
        aggregate = createFromSnapshot<any, AggregateType>(snapshot)
      }
    }

    const currentVersion = aggregate?.version ?? 0

    let events: ISerializedEvent<any>[] = []
    if (eventStorage) {
      events = await eventStorage.load(
        aggregateType,
        aggregateId,
        currentVersion + 1,
      )
    }

    if (!events.length) {
      return aggregate
    }

    if (!aggregate) {
      const AggregateClass = getAggregateClass(aggregateType)
      aggregate = new AggregateClass(aggregateId) as AggregateType
    }

    asReplayableAggregate(aggregate).reply(events.map(createEvent<AnyEvent>))

    return aggregate
  }
}
