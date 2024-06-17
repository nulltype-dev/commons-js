type ListenerMap = {
    [name: PropertyKey]: unknown[];
};
type Unsubscribe = () => void;
type AnyListener = (...args: unknown[]) => Promise<void> | void;
interface EventSubscriber<ListenerMapType extends ListenerMap> {
    subscribe<NameType extends keyof ListenerMapType>(name: NameType, listener: (...args: ListenerMapType[NameType]) => void | Promise<void>): Unsubscribe;
}
declare class EventEmitter<ListenerMapType extends ListenerMap> {
    #private;
    emit<NameType extends keyof ListenerMapType>(name: NameType, ...args: ListenerMapType[NameType]): Promise<void>;
    subscribe<NameType extends keyof ListenerMapType>(name: NameType, listener: (...args: ListenerMapType[NameType]) => Promise<void> | void): Unsubscribe;
    getSubscriber(): EventSubscriber<ListenerMapType>;
}

export { type AnyListener, EventEmitter, type EventSubscriber, type Unsubscribe };
