import type { BaseEvent } from './BaseEvent'

export interface IAggregate<IdType> {
  readonly aggregateId: IdType
  readonly type: string
  readonly version: number
}

export type AggregateConstructor<AggregateType extends IAggregate<any>> = {
  new (...args: any[]): AggregateType
  readonly TYPE: string
}

export type AggregateId<AggregateType> =
  AggregateType extends IAggregate<any> ? AggregateType['aggregateId'] : never

export interface IEvent<AggregateType extends IAggregate<any>, PayloadType> {
  readonly aggregateId: AggregateId<AggregateType>
  readonly aggregateType: string
  readonly type: string
  readonly version: number
  readonly occuredAt: number
  readonly payload: PayloadType
}

export type EventAggregate<EventType> =
  EventType extends IEvent<infer AggregateType, any> ? AggregateType : never

export type EventPayload<EventType> =
  EventType extends IEvent<any, infer PayloadType> ? PayloadType : never

export type EventConstructor<EventType extends IEvent<any, any>> = {
  new (...args: any[]): EventType
  readonly TYPE: string
}

export type AnyEvent = BaseEvent<IAggregate<any>, any>

export {}
