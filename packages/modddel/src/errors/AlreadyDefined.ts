import { ModddelError } from './ModdelError'

export class AlreadyDefined extends ModddelError {
  constructor(target: string) {
    super(`${target} already defined`)
  }
}
