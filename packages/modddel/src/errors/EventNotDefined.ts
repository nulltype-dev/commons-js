import { ModddelError } from './ModdelError'

export class EventNotDefined extends ModddelError {
  constructor(type: string) {
    super(`Event "${type}" not defined`)
  }
}
