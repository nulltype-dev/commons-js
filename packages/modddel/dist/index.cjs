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

var __accessCheck$1 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$1 = (obj, member, getter) => {
  __accessCheck$1(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$1 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet$1 = (obj, member, value, setter) => {
  __accessCheck$1(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck$1(obj, member, "access private method");
  return method;
};
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
    var _recordedEvents, _applyEvent, applyEvent_fn;
    class AggregateClass extends Constructor {
      constructor() {
        super(...arguments);
        __privateAdd$1(this, _applyEvent);
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
        __privateMethod(this, _applyEvent, applyEvent_fn).call(this, event);
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
          __privateMethod(this, _applyEvent, applyEvent_fn).call(this, event);
        }
      }
    }
    _recordedEvents = new WeakMap();
    _applyEvent = new WeakSet();
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

class NotDecoratedAggregate extends ModddelError {
  constructor() {
    super('Aggregate class must be decorated with "Aggregate"');
  }
}

var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _aggregateId;
class BaseAggregate {
  constructor(aggregateId) {
    __privateAdd(this, _aggregateId, void 0);
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

exports.Aggregate = Aggregate;
exports.BaseAggregate = BaseAggregate;
exports.BaseEvent = BaseEvent;
exports.Event = Event;
exports.When = When;
