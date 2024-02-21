import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotDecoratedEvent } from '../errors/NotDecoratedEvent'
import { DidNotOccuredInAggregate } from '../errors/DidNotOccuredInAggregate'
import {
  DecoratedAggregate,
  DecoratedEvent,
  UndecoratedEvent,
} from './test-subjects'
import { BaseEvent } from '../BaseEvent'
import { AlreadyDefined } from '../errors/AlreadyDefined'
import { Event, getEventClass } from '../decorators/Event'
import { popEvents } from '../decorators/Aggregate'
import { EventNotDefined } from '../errors/EventNotDefined'

describe('BaseEvent', () => {
  describe('not decorated event class', () => {
    it('should throw an error when accessing TYPE static property', () => {
      expect(() => {
        UndecoratedEvent.TYPE
      }).toThrow(NotDecoratedEvent)
    })

    it('should throw an error when accessing type property', () => {
      const event = new UndecoratedEvent({
        value: 'test',
      })

      expect(() => {
        event.type
      }).toThrow(NotDecoratedEvent)
    })

    it('should return payload', () => {
      const event = new UndecoratedEvent({ value: 'test2' })
      expect(event.payload).toStrictEqual({ value: 'test2' })
    })

    it('should throw error when getting not defined event', () => {
      expect(() => {
        getEventClass('UndecoratedEvent')
      }).toThrow(EventNotDefined)
    })
  })

  describe('decorated event class', () => {
    it('should return specified event name on event class', () => {
      expect(DecoratedEvent.TYPE).toBe('DecoratedEvent')
    })

    it('should return specified event name on event instance', () => {
      const event = new DecoratedEvent({ value: 666 })
      expect(event.type).toBe('DecoratedEvent')
    })

    it('should throw error when trying to define event with same name', () => {
      expect(() => {
        @Event('DecoratedEvent')
        class DuplicateEvent extends BaseEvent<any, void> {}

        new DuplicateEvent()
      }).toThrow(AlreadyDefined)
    })

    it('should return event constructor by name', () => {
      expect(getEventClass('DecoratedEvent')).toBe(DecoratedEvent)
    })
  })

  describe('accessing agregate specific fields when not used in aggregate', () => {
    let event: DecoratedEvent

    beforeEach(() => {
      event = new DecoratedEvent({ value: 666 })
    })

    it('should throw error when getting aggregateId', () => {
      expect(() => {
        event.aggregateId
      }).toThrow(DidNotOccuredInAggregate)
    })

    it('should throw error when getting aggregateType', () => {
      expect(() => {
        event.aggregateType
      }).toThrow(DidNotOccuredInAggregate)
    })

    it('should throw error when getting version', () => {
      expect(() => {
        event.version
      }).toThrow(DidNotOccuredInAggregate)
    })
  })

  describe('accessing agregate specific fields when used in aggregate', () => {
    let event: DecoratedEvent

    beforeEach(() => {
      const aggregate = new DecoratedAggregate('agg3')
      aggregate.decorateSomething()
      const events = popEvents(aggregate)
      expect(events).lengthOf(1)
      event = events[0]
    })

    it('should throw error when getting aggregateId', () => {
      expect(event.aggregateId).toBe('agg3')
    })

    it('should throw error when getting aggregateType', () => {
      expect(event.aggregateType).toBe('DecoratedAggregate')
    })

    it('should throw error when getting version', () => {
      expect(event.version).toBe(1)
    })

    it('should return now on occuredAt when event was created', () => {
      vi.useFakeTimers()
      const now = Date.now()
      const aggregate = new DecoratedAggregate('agg3')
      aggregate.decorateSomething()
      vi.advanceTimersByTime(1000)
      const event = popEvents(aggregate)[0]

      expect(event.occuredAt).toBe(now)
      vi.useRealTimers()
    })
  })
})
