'use strict';

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
var _listeners;
class EventEmitter {
  constructor() {
    __privateAdd(this, _listeners, {});
  }
  async emit(name, ...args) {
    await Promise.all(
      (__privateGet(this, _listeners)[name] ?? []).map((listener) => listener(...args))
    );
  }
  subscribe(name, listener) {
    var _a;
    __privateGet(this, _listeners)[name] ?? [];
    (_a = __privateGet(this, _listeners))[name] ?? (_a[name] = []);
    __privateGet(this, _listeners)[name].push(listener);
    return () => {
      __privateGet(this, _listeners)[name] = __privateGet(this, _listeners)[name].filter(
        (l) => l !== listener
      );
    };
  }
}
_listeners = new WeakMap();

exports.EventEmitter = EventEmitter;
