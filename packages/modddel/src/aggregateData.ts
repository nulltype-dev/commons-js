/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AggregateDefinition,
  AggregateInstance,
  AggregateOptions,
  GetAggregateEventNames,
  GetAggregateEvents,
  GetAggregateInstance,
  GetAggregateOptions,
  IEvent,
  MethodsRecord,
} from './types'

interface IAggregateEvent<EventsT, NameT extends keyof EventsT>
  extends IEvent<EventsT[NameT], NameT> {
  version: number
}

interface AggregateData<StateT, EventsT> {
  state: StateT
  version: number
  recordedEvents: IAggregateEvent<EventsT, keyof EventsT>[]
}

const aggregateDefinitions = new Map<
  string,
  {
    definition: AggregateDefinition<any, any, any>
    options: AggregateOptions<any, any, any>
  }
>()

const aggregatesData = new WeakMap<AggregateInstance, AggregateData<any, any>>()

const getAggregateDefinition = <DefinitionT>(name: string) => {
  const config = aggregateDefinitions.get(name)
  if (!config) {
    throw new Error(`Aggregate "${name}" not defined`)
  }

  return config as {
    definition: DefinitionT
    options: GetAggregateOptions<DefinitionT>
  }
}

export const registerAggregate = <
  StateT,
  ActionsT extends MethodsRecord,
  EventsT,
>(
  definition: AggregateDefinition<StateT, ActionsT, EventsT>,
  options: AggregateOptions<StateT, ActionsT, EventsT>,
) => {
  aggregateDefinitions.set(definition.name(), {
    definition,
    options,
  })
}

export const createInstanceData = <
  StateT,
  ActionsT extends MethodsRecord,
  EventsT,
>(
  instance: AggregateInstance<StateT, ActionsT, EventsT>,
  state: StateT,
) => {
  aggregatesData.set(instance, {
    state,
    version: 0,
    recordedEvents: [],
  } satisfies AggregateData<StateT, EventsT>)
}

export const aggregateData = <StateT, ActionsT extends MethodsRecord, EventsT>(
  instance: AggregateInstance<StateT, ActionsT, EventsT> | null,
) => {
  const data = instance && aggregatesData.get(instance)
  if (!data) {
    throw new Error('disposed')
  }

  return data as AggregateData<StateT, EventsT>
}

export const recordEvent = <
  StateT,
  ActionsT extends MethodsRecord,
  EventsT,
  NameT extends keyof EventsT,
>(
  instance: AggregateInstance<StateT, ActionsT, EventsT> | null,
  event: IEvent<EventsT[NameT], NameT>,
): void => {
  const data = instance && aggregatesData.get(instance)
  if (!data) {
    throw new Error('Instance has been disposed')
  }

  data.version += 1
  data.recordedEvents.push({
    name: event.name,
    payload: event.payload,
    version: data.version,
  })
}

export const popRecordedEvents = (instance: AggregateInstance) => {
  const data = aggregatesData.get(instance)
  if (!data) {
    throw new Error('Instance has been disposed')
  }

  const events = data.recordedEvents
  data.recordedEvents = []

  return events
}

type IAggregateEvents<DefinitionT> = {
  [k in GetAggregateEventNames<DefinitionT>]: IAggregateEvent<
    GetAggregateEvents<DefinitionT>,
    k
  >
}[GetAggregateEventNames<DefinitionT>]

export const loadAggregate = <
  DefinitionT extends AggregateDefinition<any, any, any>,
>(
  aggregateName: string,
  id: string,
  events: IAggregateEvents<DefinitionT>[] = [],
) => {
  const { definition: Aggregate, options } =
    getAggregateDefinition<DefinitionT>(aggregateName)
  const instance = Aggregate.create(id) as GetAggregateInstance<DefinitionT>

  if (!events.length) {
    return instance
  }

  if (!options.events) {
    throw new Error(
      'Cannot load aggregate by events when none are defined for aggregate "${options.name}".',
    )
  }

  const state = aggregateData(instance).state

  for (const event of events) {
    const handler = options.events?.[event.name]

    if (!handler) {
      throw new Error(
        `Handler for event "${String(event.name)}" not defined for aggregate "${options.name}".`,
      )
    }

    handler.call(
      {
        state,
      },
      {
        name: event.name,
        payload: event.payload,
      },
    )
  }

  return instance
}
