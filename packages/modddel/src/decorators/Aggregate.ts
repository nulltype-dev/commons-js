import { type BaseAggregate } from '../BaseAggregate'
import type { BaseEvent } from '../BaseEvent'
import { AlreadyDefined } from '../errors/AlreadyDefined'
import { HandlerNotDefined } from '../errors/HandlerNotDefined'
import type { AggregateConstructor, IAggregate } from '../types'
import { getEventHandler } from './When'
import { InvalidReplyEventVersion } from '../errors/InvalidReplyEventVersion'
import { AggregateNotDefined } from '../errors/AggregateNotDefined'

export interface AggregateOptions {
  ignoreMissingHandlers?: boolean
}

interface AggregateMixin {
  popEvents(): BaseEvent<IAggregate<any>, any>[]
  reply(events: AnyEvent[]): void
}

type AnyAggregateConstructor = AggregateConstructor<BaseAggregate<any>>
type AnyEvent = BaseEvent<IAggregate<any>, any>

const aggregates = new Map<string, AnyAggregateConstructor>()

export const versionProp = Symbol('version')

export const Aggregate = (
  aggregateType: string,
  options: AggregateOptions = {},
) => {
  const { ignoreMissingHandlers = false } = options

  if (aggregates.has(aggregateType)) {
    throw new AlreadyDefined(`Aggregate "${aggregateType}"`)
  }

  return <ConstructorType extends AnyAggregateConstructor>(
    Constructor: ConstructorType,
  ) => {
    class AggregateClass extends Constructor implements AggregateMixin {
      #recordedEvents: AnyEvent[] = []

      static get TYPE() {
        return aggregateType
      }

      get type() {
        return aggregateType
      }

      public recordThat(event: AnyEvent) {
        this[versionProp] += 1
        event.occuredIn(this)
        this.#applyEvent(event)
        this.#recordedEvents.push(event)
      }

      #applyEvent(event: AnyEvent) {
        const methodName = getEventHandler(Constructor, event.type)

        if (!methodName) {
          if (!ignoreMissingHandlers) {
            throw new HandlerNotDefined(this.type, event.type)
          }

          return
        }

        ;(this as any)[methodName](event)
      }

      popEvents(): AnyEvent[] {
        const events = this.#recordedEvents
        this.#recordedEvents = []

        return events
      }

      public reply(events: AnyEvent[]): void {
        for (const event of events) {
          const sameType = event.aggregateType === this.type
          const sameId = event.aggregateId === this.aggregateId
          const nextVersion = this.version + 1 === event.version
          const valid = sameId && sameType && nextVersion
          if (!valid) {
            throw new InvalidReplyEventVersion(this, event)
          }

          this[versionProp] = event.version
          this.#applyEvent(event)
        }
      }
    }

    aggregates.set(aggregateType, AggregateClass)

    return AggregateClass
  }
}

export const getAggregateClass = (type: string) => {
  const AggregateClass = aggregates.get(type)
  if (!AggregateClass) {
    throw new AggregateNotDefined(type)
  }

  return AggregateClass
}

export const popEvents = (aggregate: IAggregate<any>) =>
  (aggregate as unknown as AggregateMixin).popEvents()

export const asReplayableAggregate = <AggregateType extends IAggregate<any>>(
  aggregate: AggregateType,
) =>
  aggregate as AggregateType & {
    reply(events: AnyEvent[]): void
  }
