import { BaseAggregate } from '../BaseAggregate'
import { BaseEvent } from '../BaseEvent'
import { Aggregate } from '../decorators/Aggregate'
import { Event } from '../decorators/Event'
import { When } from '../decorators/When'
import type { ISnapshotable } from '../AggregateSnapshot'

@Event('DecoratedEvent')
class DecoratedEvent extends BaseEvent<
  UndecoratedAggregate | DecoratedAggregate,
  { value: number }
> {}

@Event('MissingHandlerEvent')
class MissingHandlerEvent extends BaseEvent<DecoratedAggregate, void> {}

class UndecoratedEvent extends BaseEvent<
  UndecoratedAggregate,
  {
    value: string
  }
> {}

class UndecoratedAggregate extends BaseAggregate {
  doSomething() {
    this.recordThat(new UndecoratedEvent({ value: 'test' }))
  }

  decorateSomething() {
    this.recordThat(
      new DecoratedEvent({
        value: 42,
      }),
    )
  }
}

export type DecoratedSnapshotData = {
  lastValue: number
}

@Aggregate('DecoratedAggregate', {
  ignoreMissingHandlers: true,
})
class DecoratedAggregate
  extends BaseAggregate<string>
  implements ISnapshotable<DecoratedSnapshotData>
{
  public lastValue = 0

  createSnaphshot(): DecoratedSnapshotData {
    return {
      lastValue: this.lastValue,
    }
  }

  fromSnapshot(snapshotType: DecoratedSnapshotData): void {
    this.lastValue = snapshotType.lastValue
  }

  decorateSomething(value: number = 666) {
    this.recordThat(new DecoratedEvent({ value }))
  }

  makeSomethingWithoutHandler() {
    this.recordThat(new MissingHandlerEvent())
  }

  @When(DecoratedEvent)
  handleDecoratedEvent(event: DecoratedEvent) {
    this.lastValue = event.payload.value
  }
}

@Aggregate('DecoratedAggregateWithMissingHandlers')
class DecoratedAggregateWithMissingHandlers extends BaseAggregate {
  decorateSomething() {
    this.recordThat(new DecoratedEvent({ value: 666 }))
  }
}

@Event('SimpleEvent')
class SimpleEvent extends BaseEvent<SimpleAggregate, void> {}

@Aggregate('SimpleAggregate', { ignoreMissingHandlers: true })
class SimpleAggregate extends BaseAggregate {
  makeItSimple() {
    this.recordThat(new SimpleEvent())
  }
}

export {
  UndecoratedAggregate,
  UndecoratedEvent,
  DecoratedAggregate,
  DecoratedAggregateWithMissingHandlers,
  DecoratedEvent,
  SimpleAggregate,
  SimpleEvent,
}
