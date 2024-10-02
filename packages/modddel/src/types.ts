interface ActionThis<StateT, EventsT> {
  state(): Readonly<StateT>
  recordThat: <NameT extends keyof EventsT>(
    eventName: NameT,
    payload: EventsT[NameT],
  ) => void
}

export interface IEvent<PayloadT = unknown, NameT = string> {
  name: NameT
  payload: PayloadT
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = any[]

type Action<StateT, EventsT, ArgsT extends AnyArgs> = (
  this: ActionThis<StateT, EventsT>,
  ...args: ArgsT
) => void

export type MethodsRecord = {
  [k in string]: AnyArgs
}

type EventsOptions<StateT, EventsT> = {
  [k in keyof EventsT]: (
    this: {
      state: StateT
    },
    event: IEvent<EventsT[k], k>,
  ) => void
}

export interface AggregateOptions<
  StateT = {},
  ActionsT extends MethodsRecord = {},
  EventsT = {},
> {
  name: string
  initialState: () => StateT
  events?: EventsOptions<StateT, EventsT>
  actions?: {
    [key in keyof ActionsT]: Action<StateT, EventsT, ActionsT[key]>
  }
}

export type AggregateExposedActions<ActionsT extends MethodsRecord = {}> = {
  [key in keyof ActionsT]: (...args: ActionsT[key]) => void
}

type AggregateBaseInstance = {
  id: () => string
  [Symbol.dispose]: () => void
}

export type AggregateInstance<
  _StateT = {},
  ActionsT extends MethodsRecord = {},
  _EventsT = {},
> = AggregateBaseInstance & AggregateExposedActions<ActionsT>

export type AggregateDefinition<
  StateT = {},
  ActionsT extends MethodsRecord = {},
  EventsT = {},
> = {
  name(): string
  create(id: string): AggregateInstance<StateT, ActionsT, EventsT>
}

export type GetAggregateTypes<AggregateDefinitionT> =
  AggregateDefinitionT extends AggregateDefinition<
    infer StateT,
    infer ActionsT,
    infer EventsT
  >
    ? [StateT, ActionsT, EventsT]
    : [{}, {}, {}]

export type GetAggregateInstance<AggregateDefinitionT> =
  AggregateDefinitionT extends AggregateDefinition<
    infer StateT,
    infer ActionsT,
    infer EventsT
  >
    ? ReturnType<AggregateDefinition<StateT, ActionsT, EventsT>['create']>
    : never

export type GetAggregateState<AggregateDefinitionT> =
  GetAggregateTypes<AggregateDefinitionT>[0]

export type GetAggregateActions<AggregateDefinitionT> =
  GetAggregateTypes<AggregateDefinitionT>[1]

export type GetAggregateEvents<AggregateDefinitionT> =
  GetAggregateTypes<AggregateDefinitionT>[2]

export type GetAggregateEventNames<AggregateDefinitionT> =
  keyof GetAggregateTypes<AggregateDefinitionT>[2]

export type GetAggregateOptions<AggregateDefinitionT> =
  AggregateDefinitionT extends AggregateDefinition<
    infer StateT,
    infer ActionsT,
    infer EventsT
  >
    ? AggregateOptions<StateT, ActionsT, EventsT>
    : never
