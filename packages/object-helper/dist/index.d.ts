declare const has: <ObjectType>(o: ObjectType, p: PropertyKey) => p is keyof ObjectType;

declare const simpleCopy: <ObjectType>(o: ObjectType) => ObjectType;

declare const isSet: <ObjectType>(o: ObjectType) => o is Exclude<ObjectType, null | undefined>;

export { has, isSet, simpleCopy };
