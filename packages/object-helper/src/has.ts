export const has = <ObjectType>(
  o: ObjectType,
  p: PropertyKey,
): p is keyof ObjectType => Object.prototype.hasOwnProperty.call(o, p)
