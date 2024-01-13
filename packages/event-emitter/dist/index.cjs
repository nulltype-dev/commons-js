'use strict';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
const listeners = Symbol("listeners");
class EventEmitter {
  constructor() {
    __publicField(this, _a, {});
  }
  async emit(name, ...args) {
    await Promise.all(
      (this[listeners][name] ?? []).map((listener) => listener(...args))
    );
  }
  subscribe(name, listener) {
    var _a2;
    this[listeners][name] ?? [];
    (_a2 = this[listeners])[name] ?? (_a2[name] = []);
    this[listeners][name].push(listener);
    return () => {
      this[listeners][name] = this[listeners][name].filter(
        (l) => l !== listener
      );
    };
  }
}
_a = listeners;

exports.EventEmitter = EventEmitter;
