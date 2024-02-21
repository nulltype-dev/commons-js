interface IAggregate<IdType> {
    readonly aggregateId: IdType;
    readonly type: string;
    readonly version: number;
}
type AggregateConstructor<AggregateType extends IAggregate<any>> = {
    new (...args: any[]): AggregateType;
    readonly TYPE: string;
};
type AggregateId<AggregateType> = AggregateType extends IAggregate<any> ? AggregateType['aggregateId'] : never;
interface IEvent<AggregateType extends IAggregate<any>, PayloadType> {
    readonly aggregateId: AggregateId<AggregateType>;
    readonly aggregateType: string;
    readonly type: string;
    readonly version: number;
    readonly occuredAt: number;
    readonly payload: PayloadType;
}
type EventConstructor<EventType extends IEvent<any, any>> = {
    new (...args: any[]): EventType;
    readonly TYPE: string;
};
type AnyEvent$1 = IEvent<IAggregate<any>, unknown>;

declare abstract class BaseAggregate<IdType = string> implements IAggregate<IdType> {
    #private;
    constructor(aggregateId: IdType);
    static get TYPE(): string;
    get aggregateId(): IdType;
    get version(): number;
    get type(): string;
    protected recordThat(event: AnyEvent$1): void;
}

declare abstract class BaseEvent<AggregateType extends IAggregate<any>, PayloadType> implements IEvent<AggregateType, PayloadType> {
    readonly payload: PayloadType;
    constructor(payload: PayloadType);
    get aggregateType(): string;
    get version(): number;
    get occuredAt(): number;
    get aggregateId(): AggregateId<AggregateType>;
    get type(): string;
    static get TYPE(): string;
    /**
     * @internal
     */
    occuredIn(aggregate: AggregateType): void;
}

interface AggregateOptions {
    ignoreMissingHandlers?: boolean;
}
type AnyAggregateConstructor = AggregateConstructor<BaseAggregate<any>>;
type AnyEvent = BaseEvent<IAggregate<any>, any>;
declare const Aggregate: (aggregateType: string, options?: AggregateOptions) => <ConstructorType extends AnyAggregateConstructor>(Constructor: ConstructorType) => {
    new (...args: any[]): {
        "__#2@#recordedEvents": AnyEvent[];
        readonly type: string;
        recordThat(event: AnyEvent): void;
        "__#2@#applyEvent"(event: AnyEvent): void;
        popEvents(): AnyEvent[];
        reply(events: AnyEvent[]): void;
        "__#1@#aggregateId": any;
        readonly aggregateId: any;
        readonly version: number;
    };
    readonly TYPE: string;
} & ConstructorType;

type AnyEventConstructor = EventConstructor<IEvent<any, any>>;
declare const Event: (eventType: string) => <ContructorType extends AnyEventConstructor>(Constructor: ContructorType) => {
    new (...args: any[]): {
        readonly type: string;
        readonly aggregateId: any;
        readonly aggregateType: string;
        readonly version: number;
        readonly occuredAt: number;
        readonly payload: any;
    };
    readonly TYPE: string;
} & ContructorType;

declare const When: (Constructor: EventConstructor<IEvent<IAggregate<any>, any>>) => (target: any, propName: string) => void;

export { Aggregate, BaseAggregate, BaseEvent, Event, When };
