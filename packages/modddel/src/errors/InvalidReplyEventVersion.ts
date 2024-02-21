import type { AnyEvent, IAggregate } from '../types'
import { ModddelError } from './ModdelError'

export class InvalidReplyEventVersion extends ModddelError {
  constructor(aggregate: IAggregate<any>, event: AnyEvent) {
    const messages = []
    if (event.aggregateId !== aggregate.aggregateId) {
      messages.push('invalid aggregate instance')
    }

    if (event.aggregateType !== aggregate.type) {
      messages.push('invalid aggregate type')
    }

    if (event.version !== aggregate.version + 1) {
      messages.push('invalid event version')
    }

    super(`Failed to reply event: ${messages.join(', ')}`)
  }
}
