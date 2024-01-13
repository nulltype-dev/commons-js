export const isSet = <ObjectType>(
  o: ObjectType,
): o is Exclude<ObjectType, null | undefined> => o !== null && o !== undefined
