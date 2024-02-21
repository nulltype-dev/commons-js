import { ModddelError } from './ModdelError'

export class NotSnapshotable extends ModddelError {
  constructor(type: string) {
    super(`Aggregate "${type}" must implement ISnapshotable.`)
  }
}
