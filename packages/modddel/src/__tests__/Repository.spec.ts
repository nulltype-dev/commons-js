import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IEventStorage, ISnapshotStorage } from '../Repository'
import { Repository } from '../Repository'
import type { ISnapshot } from '../AggregateSnapshot'
import { DecoratedAggregate } from './test-subjects'
import type { ISerializedEvent } from '../decorators/Event'

const snapshotStore: ISnapshot<any, any>[] = []
const eventStore: ISerializedEvent<any>[] = []
const snapshotStorageOnly: ISnapshotStorage = {
  async load(type, id) {
    return snapshotStore.find((s) => s.type === type && s.id === id)
  },
  async save(snapshot) {
    const index = snapshotStore.findIndex(
      (s) => snapshot.type === s.type && snapshot.id === s.id,
    )

    if (index >= 0) {
      snapshotStore.splice(index, 1, snapshot)
      return
    }

    snapshotStore.push(snapshot)
  },
  shouldCreateSnapshot: async () => true,
}

const snapshotAfter3Versions: ISnapshotStorage = {
  ...snapshotStorageOnly,
  shouldCreateSnapshot: async (aggregate) => {
    const snapshot = snapshotStore.find(
      (s) => s.type === aggregate.type && s.id === aggregate.aggregateId,
    )
    return aggregate.version - (snapshot?.version ?? 0) >= 3
  },
}

const eventStorage: IEventStorage = {
  async load(type, id, version) {
    const events = eventStore.filter(
      (e) =>
        e.aggregateType === type &&
        e.aggregateId === id &&
        e.version >= version,
    )
    events.sort((a, b) => a.version - b.version)

    return events
  },
  async save(events) {
    eventStore.push(...events)
  },
}

describe('Repository', () => {
  describe('Snapshot storage only', () => {
    let repository: Repository

    beforeEach(() => {
      snapshotStore.splice(0, snapshotStore.length)
      repository = new Repository({
        snapshotStorage: snapshotStorageOnly,
      })
    })

    it('should return undefined when snapshot not found', async () => {
      const aggregate = await repository.load('DecoratedAggregate', 'agg1')

      expect(aggregate).toBeUndefined()
    })

    it('should store stapshot', async () => {
      const aggregate = new DecoratedAggregate('agg1')
      aggregate.decorateSomething(82)
      await repository.save(aggregate)
      expect(snapshotStore[0]).toStrictEqual({
        id: 'agg1',
        state: {
          lastValue: 82,
        },
        type: 'DecoratedAggregate',
        version: 1,
      })
    })

    it('should not store stapshot if aggreagte was not modified', async () => {
      const aggregate = new DecoratedAggregate('agg1')
      await repository.save(aggregate)
      expect(snapshotStore.length).toBe(0)
    })

    it('should load from snapshot', async () => {
      snapshotStore.push({
        id: 'agg1',
        state: {
          lastValue: 82,
        },
        type: 'DecoratedAggregate',
        version: 1,
      })

      const aggregate = await repository.load<DecoratedAggregate>(
        'DecoratedAggregate',
        'agg1',
      )
      expect(aggregate?.lastValue).toBe(82)
    })
  })

  describe('Events storage only', () => {
    let repository: Repository

    beforeEach(() => {
      eventStore.splice(0, eventStore.length)
      repository = new Repository({
        eventStorage: eventStorage,
      })
    })

    it('should return undefined when there is no events', async () => {
      const aggreagte = await repository.load('DecoratedAggregate', 'agg1')

      expect(aggreagte).toBeUndefined()
    })

    it('should return aggregate', async () => {
      eventStore.push(
        {
          aggregateId: 'agg2',
          aggregateType: 'DecoratedAggregate',
          eventType: 'DecoratedEvent',
          occuredAt: Date.now(),
          payload: { value: 4 },
          version: 1,
        },
        {
          aggregateId: 'agg1',
          aggregateType: 'DecoratedAggregate',
          eventType: 'DecoratedEvent',
          occuredAt: Date.now() - 500,
          payload: { value: 44 },
          version: 2,
        },
        {
          aggregateId: 'agg1',
          aggregateType: 'DecoratedAggregate',
          eventType: 'DecoratedEvent',
          occuredAt: Date.now() - 1000,
          payload: { value: 4 },
          version: 1,
        },
      )

      const aggregate = await repository.load<DecoratedAggregate>(
        'DecoratedAggregate',
        'agg1',
      )

      expect(aggregate?.lastValue).toBe(44)
    })

    it('should save aggregate events', async () => {
      vi.useFakeTimers()
      const now = Date.now()
      const aggreagte = new DecoratedAggregate('agg5')
      aggreagte.decorateSomething(1002)
      vi.useRealTimers()

      await repository.save(aggreagte)
      expect(eventStore[0]).toStrictEqual({
        aggregateId: 'agg5',
        aggregateType: 'DecoratedAggregate',
        eventType: 'DecoratedEvent',
        occuredAt: now,
        payload: { value: 1002 },
        version: 1,
      })
    })
  })

  describe('Both stores', () => {
    describe('Snapshot storage only', () => {
      let repository: Repository

      beforeEach(() => {
        eventStore.splice(0, eventStore.length)
        snapshotStore.splice(0, snapshotStore.length)
        repository = new Repository({
          eventStorage,
          snapshotStorage: snapshotAfter3Versions,
        })
      })

      it('should load from snapshot and update from event store', async () => {
        eventStore.push(
          {
            aggregateId: 'agg1',
            aggregateType: 'DecoratedAggregate',
            eventType: 'DecoratedEvent',
            occuredAt: Date.now(),
            payload: { value: 4444 },
            version: 3,
          },
          {
            aggregateId: 'agg1',
            aggregateType: 'DecoratedAggregate',
            eventType: 'DecoratedEvent',
            occuredAt: Date.now() - 500,
            payload: { value: 44 },
            version: 2,
          },
          {
            aggregateId: 'agg1',
            aggregateType: 'DecoratedAggregate',
            eventType: 'DecoratedEvent',
            occuredAt: Date.now() - 1000,
            payload: { value: 4 },
            version: 1,
          },
        )
        snapshotStore.push({
          id: 'agg1',
          state: {
            lastValue: 44,
          },
          type: 'DecoratedAggregate',
          version: 2,
        })

        const aggregate = await repository.load<DecoratedAggregate>(
          'DecoratedAggregate',
          'agg1',
        )
        expect(aggregate?.lastValue).toBe(4444)
      })

      it('should not save the snapshot if is not older than 3 versions', async () => {
        const aggregate = new DecoratedAggregate('agg1')
        aggregate.decorateSomething()
        aggregate.decorateSomething()
        await repository.save(aggregate)
        expect(snapshotStore.length).toBe(0)
      })

      it('should save the snapshot if is older than 3 versions', async () => {
        const aggregate = new DecoratedAggregate('agg1')
        aggregate.decorateSomething(1)
        aggregate.decorateSomething(2)
        aggregate.decorateSomething(3)
        aggregate.decorateSomething(4)
        await repository.save(aggregate)
        expect(snapshotStore[0]).toStrictEqual({
          id: 'agg1',
          state: {
            lastValue: 4,
          },
          type: 'DecoratedAggregate',
          version: 4,
        })
      })
    })
  })
})
