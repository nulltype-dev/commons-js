import { describe, it, expect, beforeEach } from 'vitest'
import { NotDecoratedAggregate } from '../errors/NotDecoratedAggregate'
import type { DecoratedSnapshotData } from './test-subjects'
import {
  DecoratedAggregate,
  DecoratedAggregateWithMissingHandlers,
  DecoratedEvent,
  UndecoratedAggregate,
  UndecoratedEvent,
} from './test-subjects'
import { HandlerNotDefined } from '../errors/HandlerNotDefined'
import {
  Aggregate,
  asReplayableAggregate,
  getAggregateClass,
  popEvents,
} from '../decorators/Aggregate'
import { BaseAggregate } from '../BaseAggregate'
import { AlreadyDefined } from '../errors/AlreadyDefined'
import type { IAggregate } from '../types'
import { createEvent } from '../BaseEvent'
import { InvalidReplyEventVersion } from '../errors/InvalidReplyEventVersion'
import { createFromSnapshot, toSnapshot } from '../AggregateSnapshot'
import { NotSnapshotable } from '../errors/NotSnapshotable'
import { AggregateNotDefined } from '../errors/AggregateNotDefined'

describe('BaseAggregate', () => {
  describe('not decorated aggregate', () => {
    let aggregate: UndecoratedAggregate

    beforeEach(() => {
      aggregate = new UndecoratedAggregate('agg1')
    })

    it('version of the aggregate should be 0 on creation', () => {
      expect(aggregate.version).toBe(0)
    })

    it('should throw an error when accessing TYPE static property', () => {
      expect(() => {
        UndecoratedAggregate.TYPE
      }).toThrow(NotDecoratedAggregate)
    })

    it('should throw an error when accessing type property', () => {
      expect(() => {
        aggregate.type
      }).toThrow(NotDecoratedAggregate)
    })

    it('should throw an error when calling recordThat method', () => {
      expect(() => {
        aggregate.doSomething()
      }).toThrow(NotDecoratedAggregate)
    })

    it('should throw an error when getting aggregate by class', () => {
      expect(() => {
        getAggregateClass('UndecoratedAggregate')
      }).toThrow(AggregateNotDefined)
    })
  })

  describe('decorated aggregate', () => {
    it("should return aggregate name on it's class", () => {
      expect(DecoratedAggregate.TYPE).toBe('DecoratedAggregate')
    })

    it('should return aggregate name on intstance', () => {
      const aggregate = new DecoratedAggregate('agg2')
      expect(aggregate.type).toBe('DecoratedAggregate')
    })

    it('should execute handler bound to event', () => {
      const aggregate = new DecoratedAggregate('agg3')
      aggregate.decorateSomething()
      expect(aggregate.lastValue).toBe(666)
    })

    it('should throw error when trying to define aggregate with same name', () => {
      expect(() => {
        @Aggregate('DecoratedAggregate')
        class DuplicateAggregate extends BaseAggregate {}

        new DuplicateAggregate('duplicate')
      }).toThrow(AlreadyDefined)
    })

    describe('not ignoring missing handlers', () => {
      it('should throw error when handler is missing', () => {
        const aggregate = new DecoratedAggregateWithMissingHandlers('agg-next')
        expect(() => {
          aggregate.decorateSomething()
        }).toThrow(HandlerNotDefined)
      })
    })

    describe('igonring missing handlers', () => {
      it('should ignore missing handler', () => {
        expect(() => {
          const aggregate = new DecoratedAggregate('agg3')
          aggregate.makeSomethingWithoutHandler()
        }).not.toThrow(HandlerNotDefined)
      })
    })

    it('should throw error when trying to reply event for other instance', () => {
      expect(() => {
        const otherAggregate = asReplayableAggregate(
          new DecoratedAggregate('agg2'),
        )
        const event = createEvent<DecoratedEvent>({
          aggregateId: 'agg1',
          aggregateType: DecoratedAggregate.TYPE,
          eventType: DecoratedEvent.TYPE,
          occuredAt: Date.now(),
          payload: {
            value: 10,
          },
          version: 1,
        })
        otherAggregate.reply([event])
      }).toThrow('invalid aggregate instance')
    })

    it('should throw error when trying to reply event for other aggregate', () => {
      expect(() => {
        const otherAggregate = asReplayableAggregate(
          new DecoratedAggregate('agg2'),
        )
        const event = createEvent<DecoratedEvent>({
          aggregateId: 'agg2',
          aggregateType: DecoratedAggregateWithMissingHandlers.TYPE,
          eventType: DecoratedEvent.TYPE,
          occuredAt: Date.now(),
          payload: {
            value: 10,
          },
          version: 1,
        })
        otherAggregate.reply([event])
      }).toThrow('invalid aggregate type')
    })

    it('should throw error when trying to reply event for other aggregate', () => {
      expect(() => {
        const otherAggregate = asReplayableAggregate(
          new DecoratedAggregate('agg2'),
        )
        const event = createEvent<DecoratedEvent>({
          aggregateId: 'agg2',
          aggregateType: DecoratedAggregate.TYPE,
          eventType: DecoratedEvent.TYPE,
          occuredAt: Date.now(),
          payload: {
            value: 10,
          },
          version: 2,
        })
        otherAggregate.reply([event])
      }).toThrow('invalid event version')
    })

    it('should return aggregate class', () => {
      expect(getAggregateClass('DecoratedAggregate')).toBe(DecoratedAggregate)
    })

    describe('successfull event reply for aggregate', () => {
      let otherAggregate: DecoratedAggregate

      beforeEach(() => {
        const aggregate = asReplayableAggregate(new DecoratedAggregate('agg2'))
        const event = createEvent<DecoratedEvent>({
          aggregateId: 'agg2',
          aggregateType: DecoratedAggregate.TYPE,
          eventType: DecoratedEvent.TYPE,
          occuredAt: Date.now(),
          payload: {
            value: 4124,
          },
          version: 1,
        })
        aggregate.reply([event])
        otherAggregate = aggregate
      })

      it('should update aggregate state', () => {
        expect(otherAggregate.lastValue).toBe(4124)
      })

      it('should have correct version', () => {
        expect(otherAggregate.version).toBe(1)
      })
    })

    describe('creation snapshots', () => {
      it('creates snapshot', () => {
        const aggregate = new DecoratedAggregate('agg1')
        aggregate.decorateSomething(1234)

        expect(toSnapshot(aggregate)).toStrictEqual({
          id: 'agg1',
          state: {
            lastValue: 1234,
          },
          type: 'DecoratedAggregate',
          version: 1,
        })
      })

      it('throws error if aggregate is not snapshotable', () => {
        expect(() => {
          toSnapshot(new DecoratedAggregateWithMissingHandlers('agg1'))
        }).toThrow(NotSnapshotable)
      })
    })

    describe('snapshot loading', () => {
      let aggregate: DecoratedAggregate

      beforeEach(() => {
        aggregate = createFromSnapshot<
          DecoratedSnapshotData,
          DecoratedAggregate
        >({
          id: 'agg1',
          state: {
            lastValue: 4321,
          },
          type: 'DecoratedAggregate',
          version: 1,
        })
      })

      it('has snapshot version', () => {
        expect(aggregate.version).toBe(1)
      })

      it('has right id', () => {
        expect(aggregate.aggregateId).toBe('agg1')
      })

      it('has proper type', () => {
        expect(aggregate.type).toBe('DecoratedAggregate')
      })

      it('has correct state', () => {
        expect(aggregate.lastValue).toBe(4321)
      })
    })

    describe('invalid snapshot loading', () => {
      it('should throw error when snapshot aggregate is not snapshotable', () => {
        expect(() => {
          createFromSnapshot<DecoratedSnapshotData, DecoratedAggregate>({
            id: 'agg1',
            state: {
              lastValue: 4321,
            },
            type: 'DecoratedAggregateWithMissingHandlers',
            version: 1,
          })
        }).toThrow(NotSnapshotable)
      })
    })
  })
})
