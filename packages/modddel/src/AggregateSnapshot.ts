import { aggregateVersion, getAggregateClass } from './decorators/Aggregate'
import { NotSnapshotable } from './errors/NotSnapshotable'
import type { AggregateId, IAggregate } from './types'

export interface ISnapshot<IdType, StateType> {
  id: IdType
  type: string
  version: number
  state: StateType
}

export interface ISnapshotable<StateType> {
  createSnaphshot(): StateType
  fromSnapshot(snapshotType: StateType): void
}

export const isSnapshotable = <StateType>(
  aggregate: any,
): aggregate is ISnapshotable<StateType> =>
  Boolean(aggregate.createSnaphshot) &&
  Boolean(aggregate.fromSnapshot) &&
  aggregate.type &&
  aggregate.aggregateId &&
  aggregate.version !== undefined

export const createFromSnapshot = <
  StateType,
  AggregateType extends IAggregate<any>,
>(
  snapshot: ISnapshot<AggregateId<AggregateType>, StateType>,
) => {
  const { type, id, state, version } = snapshot
  const AggregateClass = getAggregateClass(type)
  const aggregate = new AggregateClass(id)

  if (!isSnapshotable(aggregate)) {
    throw new NotSnapshotable(type)
  }

  aggregate.fromSnapshot(state)
  aggregateVersion(aggregate).set(version)

  return aggregate as unknown as AggregateType
}

export const toSnapshot = <StateType, AggregateType extends IAggregate<any>>(
  aggregate: AggregateType,
): ISnapshot<AggregateId<AggregateType>, StateType> => {
  if (!isSnapshotable<StateType>(aggregate)) {
    throw new NotSnapshotable(aggregate.type)
  }

  return {
    id: aggregate.aggregateId,
    state: aggregate.createSnaphshot(),
    type: aggregate.type,
    version: aggregate.version,
  }
}
