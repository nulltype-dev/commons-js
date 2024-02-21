import { ModddelError } from './ModdelError'

export class NotDecoratedAggregate extends ModddelError {
  constructor() {
    super('Aggregate class must be decorated with "Aggregate"')
  }
}
