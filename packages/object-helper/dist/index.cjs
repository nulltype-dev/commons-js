'use strict';

const has = (o, p) => Object.prototype.hasOwnProperty.call(o, p);

const simpleCopy = (o) => JSON.parse(JSON.stringify(o));

const isSet = (o) => o !== null && o !== void 0;

exports.has = has;
exports.isSet = isSet;
exports.simpleCopy = simpleCopy;
