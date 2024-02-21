import { ModddelError } from './ModdelError'

export class AggregateNotDefined extends ModddelError {
  constructor(type: string) {
    super(`Aggregate "${type}" not defined`)
  }
}
