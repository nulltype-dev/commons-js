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
type AnyEvent = BaseEvent<IAggregate<any>, any>;

declare abstract class BaseAggregate<IdType = string> implements IAggregate<IdType> {
    #private;
    constructor(aggregateId: IdType);
    static get TYPE(): string;
    get aggregateId(): IdType;
    get version(): number;
    get type(): string;
    protected recordThat(event: AnyEvent): void;
}

interface AggregateOptions {
    ignoreMissingHandlers?: boolean;
}
type AnyAggregateConstructor = AggregateConstructor<BaseAggregate<any>>;
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
interface ISerializedEvent<PayloadType> {
    aggregateId: any;
    aggregateType: string;
    eventType: string;
    version: number;
    occuredAt: number;
    payload: PayloadType;
}
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

interface ISnapshot<IdType, StateType> {
    id: IdType;
    type: string;
    version: number;
    state: StateType;
}
interface ISnapshotable<StateType> {
    createSnaphshot(): StateType;
    fromSnapshot(snapshotType: StateType): void;
}

interface ISnapshotStorage {
    shouldCreateSnapshot<AggregateType extends IAggregate<any>>(aggregate: AggregateType): Promise<boolean>;
    save(snapshot: ISnapshot<any, any>): Promise<void>;
    load<IdType>(aggregateType: string, aggregateId: IdType): Promise<ISnapshot<IdType, any> | undefined>;
}
interface IEventStorage {
    save(events: ISerializedEvent<any>[]): Promise<void>;
    load<IdType>(aggregateType: string, aggregateId: IdType, sinceVersion: number): Promise<ISerializedEvent<any>[]>;
}
interface RepositoryOptions {
    snapshotStorage?: ISnapshotStorage;
    eventStorage?: IEventStorage;
}
declare class Repository {
    private options;
    constructor(options: RepositoryOptions);
    save(aggregate: IAggregate<any>): Promise<void>;
    load<AggregateType extends BaseAggregate<any>>(aggregateType: string, aggregateId: AggregateId<AggregateType>): Promise<AggregateType | undefined>;
}

export { Aggregate, BaseAggregate, BaseEvent, Event, type IEventStorage, type ISnapshot, type ISnapshotStorage, type ISnapshotable, Repository, When };
