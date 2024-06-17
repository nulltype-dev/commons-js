'use strict';

class ModddelError extends Error {
}

class AlreadyDefined extends ModddelError {
  constructor(target) {
    super(`${target} already defined`);
  }
}

class HandlerNotDefined extends ModddelError {
  constructor(aggregateType, eventType) {
    super(
      `Handler for event "${eventType}" not found in aggregate "${aggregateType}"`
    );
  }
}

const eventHandlers = /* @__PURE__ */ new WeakMap();
const getEventHandler = (target, eventType) => {
  const handlers = eventHandlers.get(target);
  if (!handlers) {
    return void 0;
  }
  return handlers.get(eventType);
};
const When = (Constructor) => {
  return (target, propName) => {
    let handlers = eventHandlers.get(target.constructor);
    if (!handlers) {
      handlers = /* @__PURE__ */ new Map();
      eventHandlers.set(target.constructor, handlers);
    }
    handlers.set(Constructor.TYPE, propName);
  };
};

class InvalidReplyEventVersion extends ModddelError {
  constructor(aggregate, event) {
    const messages = [];
    if (event.aggregateId !== aggregate.aggregateId) {
      messages.push("invalid aggregate instance");
    }
    if (event.aggregateType !== aggregate.type) {
      messages.push("invalid aggregate type");
    }
    if (event.version !== aggregate.version + 1) {
      messages.push("invalid event version");
    }
    super(`Failed to reply event: ${messages.join(", ")}`);
  }
}

class AggregateNotDefined extends ModddelError {
  constructor(type) {
    super(`Aggregate "${type}" not defined`);
  }
}

var __typeError$1 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck$1(obj, member, "access private method"), method);
const aggregates = /* @__PURE__ */ new Map();
const aggregateVersionMap = /* @__PURE__ */ new WeakMap();
const aggregateVersion = (aggregate) => ({
  bump() {
    this.set(this.get() + 1);
  },
  get() {
    return aggregateVersionMap.get(aggregate) ?? 0;
  },
  set(version) {
    aggregateVersionMap.set(aggregate, version);
  }
});
const Aggregate = (aggregateType, options = {}) => {
  const { ignoreMissingHandlers = false } = options;
  if (aggregates.has(aggregateType)) {
    throw new AlreadyDefined(`Aggregate "${aggregateType}"`);
  }
  return (Constructor) => {
    var _recordedEvents, _AggregateClass_instances, applyEvent_fn;
    class AggregateClass extends Constructor {
      constructor() {
        super(...arguments);
        __privateAdd$1(this, _AggregateClass_instances);
        __privateAdd$1(this, _recordedEvents, []);
      }
      static get TYPE() {
        return aggregateType;
      }
      get type() {
        return aggregateType;
      }
      recordThat(event) {
        aggregateVersion(this).bump();
        event.occuredIn(this);
        __privateMethod(this, _AggregateClass_instances, applyEvent_fn).call(this, event);
        __privateGet$1(this, _recordedEvents).push(event);
      }
      popEvents() {
        const events = __privateGet$1(this, _recordedEvents);
        __privateSet$1(this, _recordedEvents, []);
        return events;
      }
      reply(events) {
        for (const event of events) {
          const sameType = event.aggregateType === this.type;
          const sameId = event.aggregateId === this.aggregateId;
          const nextVersion = this.version + 1 === event.version;
          const valid = sameId && sameType && nextVersion;
          if (!valid) {
            throw new InvalidReplyEventVersion(this, event);
          }
          aggregateVersion(this).set(event.version);
          __privateMethod(this, _AggregateClass_instances, applyEvent_fn).call(this, event);
        }
      }
    }
    _recordedEvents = new WeakMap();
    _AggregateClass_instances = new WeakSet();
    applyEvent_fn = function(event) {
      const methodName = getEventHandler(Constructor, event.type);
      if (!methodName) {
        if (!ignoreMissingHandlers) {
          throw new HandlerNotDefined(this.type, event.type);
        }
        return;
      }
      this[methodName](event);
    };
    aggregates.set(aggregateType, AggregateClass);
    return AggregateClass;
  };
};
const getAggregateClass = (type) => {
  const AggregateClass = aggregates.get(type);
  if (!AggregateClass) {
    throw new AggregateNotDefined(type);
  }
  return AggregateClass;
};
const popEvents = (aggregate) => aggregate.popEvents();
const asReplayableAggregate = (aggregate) => aggregate;

class NotDecoratedAggregate extends ModddelError {
  constructor() {
    super('Aggregate class must be decorated with "Aggregate"');
  }
}

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _aggregateId;
class BaseAggregate {
  constructor(aggregateId) {
    __privateAdd(this, _aggregateId);
    __privateSet(this, _aggregateId, aggregateId);
  }
  static get TYPE() {
    throw new NotDecoratedAggregate();
  }
  get aggregateId() {
    return __privateGet(this, _aggregateId);
  }
  get version() {
    return aggregateVersion(this).get();
  }
  get type() {
    throw new NotDecoratedAggregate();
  }
  recordThat(event) {
    throw new NotDecoratedAggregate();
  }
}
_aggregateId = new WeakMap();

class EventNotDefined extends ModddelError {
  constructor(type) {
    super(`Event "${type}" not defined`);
  }
}

const events = /* @__PURE__ */ new Map();
const eventData = /* @__PURE__ */ new WeakMap();
const getEventData = (event) => {
  let data = eventData.get(event);
  if (!data) {
    data = {
      aggregateId: void 0,
      aggregateType: void 0,
      occuredAt: 0,
      version: 0
    };
    eventData.set(event, data);
  }
  return data;
};
const createEvent = (serializedData) => {
  const { aggregateId, aggregateType, eventType, occuredAt, payload, version } = serializedData;
  const EventClass = getEventClass(eventType);
  const event = new EventClass(payload);
  const data = getEventData(event);
  data.aggregateId = aggregateId;
  data.aggregateType = aggregateType;
  data.version = version;
  data.occuredAt = occuredAt;
  return event;
};
const Event = (eventType) => {
  if (events.has(eventType)) {
    throw new AlreadyDefined(`Event "${eventType}"`);
  }
  return (Constructor) => {
    class EventClass extends Constructor {
      static get TYPE() {
        return eventType;
      }
      get type() {
        return eventType;
      }
    }
    events.set(eventType, EventClass);
    return EventClass;
  };
};
const getEventClass = (eventType) => {
  const EventClass = events.get(eventType);
  if (!EventClass) {
    throw new EventNotDefined(eventType);
  }
  return EventClass;
};
const serializeEvent = (event) => ({
  aggregateId: event.aggregateId,
  aggregateType: event.aggregateType,
  eventType: event.type,
  occuredAt: event.occuredAt,
  payload: event.payload,
  version: event.version
});

class DidNotOccuredInAggregate extends ModddelError {
  constructor() {
    super(
      'Event did not occured in aggregate. Use event instance in "recordThat" method.'
    );
  }
}

class NotDecoratedEvent extends ModddelError {
  constructor() {
    super('Event class must be decorated with "Event"');
  }
}

class BaseEvent {
  constructor(payload) {
    this.payload = payload;
    getEventData(this).occuredAt = Date.now();
  }
  get aggregateType() {
    const type = getEventData(this).aggregateType;
    if (!type) {
      throw new DidNotOccuredInAggregate();
    }
    return type;
  }
  get version() {
    const version = getEventData(this).version;
    if (!version) {
      throw new DidNotOccuredInAggregate();
    }
    return version;
  }
  get occuredAt() {
    return getEventData(this).occuredAt;
  }
  get aggregateId() {
    const id = getEventData(this).aggregateId;
    if (!id) {
      throw new DidNotOccuredInAggregate();
    }
    return id;
  }
  get type() {
    throw new NotDecoratedEvent();
  }
  static get TYPE() {
    throw new NotDecoratedEvent();
  }
  /**
   * @internal
   */
  occuredIn(aggregate) {
    const data = getEventData(this);
    data.aggregateId = aggregate.aggregateId;
    data.aggregateType = aggregate.type;
    data.version = aggregate.version;
  }
}

class NotSnapshotable extends ModddelError {
  constructor(type) {
    super(`Aggregate "${type}" must implement ISnapshotable.`);
  }
}

const isSnapshotable = (aggregate) => Boolean(aggregate.createSnaphshot) && Boolean(aggregate.fromSnapshot) && aggregate.type && aggregate.aggregateId && aggregate.version !== void 0;
const createFromSnapshot = (snapshot) => {
  const { type, id, state, version } = snapshot;
  const AggregateClass = getAggregateClass(type);
  const aggregate = new AggregateClass(id);
  if (!isSnapshotable(aggregate)) {
    throw new NotSnapshotable(type);
  }
  aggregate.fromSnapshot(state);
  aggregateVersion(aggregate).set(version);
  return aggregate;
};
const toSnapshot = (aggregate) => {
  if (!isSnapshotable(aggregate)) {
    throw new NotSnapshotable(aggregate.type);
  }
  return {
    id: aggregate.aggregateId,
    state: aggregate.createSnaphshot(),
    type: aggregate.type,
    version: aggregate.version
  };
};

class Repository {
  constructor(options) {
    this.options = options;
  }
  async save(aggregate) {
    const { snapshotStorage, eventStorage } = this.options;
    const events = popEvents(aggregate).map(serializeEvent);
    if (!events.length) {
      return;
    }
    if (eventStorage) {
      await eventStorage.save(events);
    }
    if (snapshotStorage && isSnapshotable(aggregate) && await snapshotStorage.shouldCreateSnapshot(aggregate)) {
      const snapshot = toSnapshot(aggregate);
      await snapshotStorage.save(snapshot);
    }
  }
  async load(aggregateType, aggregateId) {
    let aggregate = void 0;
    const { snapshotStorage, eventStorage } = this.options;
    if (snapshotStorage) {
      const snapshot = await snapshotStorage.load(
        aggregateType,
        aggregateId
      );
      if (snapshot) {
        aggregate = createFromSnapshot(snapshot);
      }
    }
    const currentVersion = aggregate?.version ?? 0;
    let events = [];
    if (eventStorage) {
      events = await eventStorage.load(
        aggregateType,
        aggregateId,
        currentVersion + 1
      );
    }
    if (!events.length) {
      return aggregate;
    }
    if (!aggregate) {
      const AggregateClass = getAggregateClass(aggregateType);
      aggregate = new AggregateClass(aggregateId);
    }
    asReplayableAggregate(aggregate).reply(events.map(createEvent));
    return aggregate;
  }
}

exports.Aggregate = Aggregate;
exports.BaseAggregate = BaseAggregate;
exports.BaseEvent = BaseEvent;
exports.Event = Event;
exports.Repository = Repository;
exports.When = When;
