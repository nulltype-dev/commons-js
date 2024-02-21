import { Aggregate } from './decorators/Aggregate'
import { BaseAggregate } from './BaseAggregate'
import { BaseEvent } from './BaseEvent'
import { Event } from './decorators/Event'
import { When } from './decorators/When'
import { type ISnapshotable, type ISnapshot } from './AggregateSnapshot'
import {
  Repository,
  type IEventStorage,
  type ISnapshotStorage,
} from './Repository'

export {
  Aggregate,
  BaseAggregate,
  BaseEvent,
  Event,
  IEventStorage,
  ISnapshot,
  ISnapshotable,
  ISnapshotStorage,
  Repository,
  When,
}
