declare const listeners: unique symbol;
type ListenerMap = {
    [name: PropertyKey]: unknown[];
};
type Unsubscribe = () => void;
type AnyListener = (...args: unknown[]) => Promise<void> | void;
declare class EventEmitter<ListenerMapType extends ListenerMap> {
    private [listeners];
    emit<NameType extends keyof ListenerMapType>(name: NameType, ...args: ListenerMapType[NameType]): Promise<void>;
    subscribe<NameType extends keyof ListenerMapType>(name: NameType, listener: (...args: ListenerMapType[NameType]) => void): Unsubscribe;
}

export { type AnyListener, EventEmitter, type Unsubscribe };
