import { ModddelError } from './ModdelError'

export class HandlerNotDefined extends ModddelError {
  constructor(aggregateType: string, eventType: string) {
    super(
      `Handler for event "${eventType}" not found in aggregate "${aggregateType}"`,
    )
  }
}
