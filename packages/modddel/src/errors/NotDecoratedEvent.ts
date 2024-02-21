import { ModddelError } from './ModdelError'

export class NotDecoratedEvent extends ModddelError {
  constructor() {
    super('Event class must be decorated with "Event"')
  }
}
