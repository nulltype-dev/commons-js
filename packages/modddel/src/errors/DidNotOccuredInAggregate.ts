import { ModddelError } from './ModdelError'

export class DidNotOccuredInAggregate extends ModddelError {
  constructor() {
    super(
      'Event did not occured in aggregate. Use event instance in "recordThat" method.',
    )
  }
}
