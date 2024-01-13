export const simpleCopy = <ObjectType>(o: ObjectType): ObjectType =>
  JSON.parse(JSON.stringify(o))
