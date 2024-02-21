---
outline: [2,3]
---

# Modddel

This is simple framework designed to support implementation of the DDD principles and provide structured approach for building robust and maintainable applications. Below is an introduction to the key concepts and components of our DDD Model Framework.

## Installation

```bash
npm i @nulltype/modddel
```

## Principles

### Entity

Entities represent objects with a distinct identity, and they encapsulate behavior that is relevant to the business domain.

### Value object

Value objects are objects without a distinct identity. They are used to describe characteristics or attributes of entities. Our framework provides a concise way to model and handle value objects.

### Aggregate root

Aggregates are groups of related entities and value objects treated as a single unit. The aggregate root is the entry point for interactions with the aggregate. The framework supports the definition and management of aggregates in your domain model.

### Domain events

Domain events represent significant state changes in your domain. The framework includes support for defining and handling domain events, enabling loose coupling between different parts of your system.

### Repository

Repositories provide a mechanism for accessing and persisting aggregates. Our DDD Model Framework includes a repository pattern that helps you abstract the data access layer and work with aggregates in a consistent manner.

## Usage

As an example we will create an order to which we add an item.
Entities, ValueObjects are up to you how you will implement it. Events and aggregate roots need some love.

### Basic aggregate root 

First let's start with empty aggregate class.

```ts
@Aggregate('myshop.order')
class Order extends BaseAggregate<number> {}
```

The Aggregate Root is a critical concept in our application's architecture, encapsulating the business logic related to an order within a business transaction. This ensures that all operations within the aggregate adhere to the "all or nothing" principle – meaning that either all changes happen successfully, or none of them do.

Every aggregate class must extend the `BaseAggregate` class, providing essential functionality and setting the foundation for consistent behavior across all aggregates.

An aggregate has a unique identity which type can be specified as generic type parameter of BaseAggregate. This identity is crucial for distinguishing different instances of the same aggregate type.

Each aggregate must be decorated with the `Aggregate` decorator to enable the framework to manage aggregates seamlessly. This decoration allows the framework to identify and orchestrate the lifecycle of the aggregate. The aggregate type name is the first argument of the decorator.

### `OrderItemAdded` Event

Changes within an aggregate are accomplished through events, capturing state transitions and serving as a record of meaningful occurrences. Events are used as a standard practice to communicate changes within the aggregate.

A specific event defined for the `Order` aggregate, in our example, is the `OrderItemAdded` event. This event is raised when a new item is added to an order, capturing essential details such as the product ID and quantity.

Event needs to be decorated with the `Event` decorator. 
This decorator requires a specified name to uniquely identify the event.
Also ensure to extend `BaseEvent` class.
This additional decoration provides essential metadata for the framework to manage events consistently.

The BaseEvent class is generic, with type parameters indicating the aggregate root it should be associated with (`Order` in this case) and the payload type. This ensures that events are properly tied to their corresponding aggregate roots and carry the appropriate payload information. The payload type would contain the specific data associated with the event.


```ts
@Event('myshop.order.itemAdded')
class OrderItemAdded extends BaseEvent<Order, {
  productId: string,
  quantity: number
}> {}
```

### Aggregate root logic

To add an item to the order, the `Order` encapsulates the necessary business logic.
The `addItem` method is responsible for ensuring that all business constraints are fulfilled.
In this case the quantity being added must be greater than 0.
If the constraint is met, an OrderItemAdded event is recorded to capture this state change within the aggregate. This approach maintains the integrity of the order and communicates significant changes through events.

```ts
@Aggregate('myshop.order')
class Order extends BaseAggregate<number> {
  public addItem(productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('You must add at least one quantity')
    }

    this.recordThat(new OrderItemAdded({
      productId,
      quantity
    }))
  }
}
```

### Defining Entity

Once the `OrderItemAdded` event is recorded, it needs to be applied to the `Order` state. In the aggregate state, we maintain a list of added items, treating each item as an entity with its own identity specified by the productId. This list serves as a record of all items added to the order.

```ts
class OrderItem {
  constructor(
    public id: string,
    public quantity: string
  ) {}
}
```

By applying the event, we update the state of the aggregate to reflect the addition of a new item. The aggregate state, including the list of added items, is thus kept in sync with the sequence of events that have occurred.

This approach ensures that the aggregate reflects the true state of the order, and any subsequent operations or queries can accurately consider the added items.

It's important to note that the specifics of applying the event will depend on the implementation details of your aggregate and how you choose to represent the state of added items within the aggregate.

### Applying state

To apply events to the aggregate state, we define an event handler method within the `Order`. This method is annotated with the `When` decorator, specifying the event type it is designed to handle, in this case, `OrderItemAdded`.

This can seem as an necessary double work. This handler indicates the state has change in the moment the event has happened,
but it also plays a crucial role during the reconstruction of the aggregate state from the repository. When an aggregate is loaded from the repository, the framework will use the event handler methods decorated with `When` to reapply the events, rebuilding the aggregate's state to its latest version.

This mechanism ensures that the aggregate state, including the list of added items, is accurately reconstructed based on the sequence of events stored in the repository. By centralizing the event handling logic, the aggregate maintains consistency, both during its lifecycle and when it is loaded from storage.

This approach follows the principles of event sourcing, where events are the source of truth, capturing changes to the aggregate state over time. The event handler method, annotated with When, acts as the bridge between the events and the aggregate state, providing a clear and structured way to apply changes and maintain the integrity of the aggregate.


```ts
@Aggregate('myshop.order')
class Order extends BaseAggregate<number> {
  private items: OrderItem[] = []
  
  @When(OrderItemAdded)
  onItemAdded(event: OrderItemAdded) {
    const { productId, quantity } = event.payload
    
    const item = this.items.find((item) => item.productId === productId)
    if (item) {
      item.quantity += quantity
    } else {
      this.items.push(new OrderItem(productId, quantity))
    }
  }
}
```

### Adaptability to changing business constraints

The `addItem` method in the `OrderAggregate` is designed to check the business constraints at the time of invocation, ensuring that the quantity being added adheres to the current constraints. However, when the event is handled, it applies changes to the aggregate based on the state at the time the event occurred. This creates an interesting and powerful dynamic – the aggregate, when handling events, adapts to the constraints that were applicable at the time the events were recorded.

This design enables the system to accommodate changes in business constraints over time. Suppose the business constraints for adding items to an order are modified in the future. In that case, the `addItem` method can incorporate the updated constraints, ensuring that new additions adhere to the latest rules. However, when handling historical events during state reconstruction, the aggregate adapts to the constraints that were in place when the events were originally recorded.

This adaptability is a key advantage of event sourcing. It allows the application to evolve its business logic without compromising the ability to reconstruct historical states accurately. The `When` decorator, coupled with the event handling methods, serves as the mechanism that applies these changes consistently, whether handling new events or reconstructing past states from the repository.


### Repository

The repository is capable of saving aggregates in both the event store and the snapshot store, providing flexibility in managing state changes efficiently.

**Saving in the Event Store**

When aggregates undergo state changes, the repository records corresponding events in the event store, capturing a detailed history of changes over time. Additionally, the event store can be utilized to push events forward, providing flexibility in implementation.

**Saving in the Snapshot Store**

To optimize retrieval efficiency, the repository generates snapshots of aggregates at specific versions. For example, a snapshot can be created every 100 versions, reducing the necessity to replay all events during loading. Alternatively, it's possible to exclusively use the snapshot store on every version change, omitting the need to save the events.

These flexible approaches allow for tailored implementation based on the application's requirements and performance considerations.

```ts
const repository = new Repository({
  snapshotStorage, // your implementation
  eventStorage, // your implementation
})

// creating aggregate
const order = new Order(4271983)
order.addItem('P1234', 2)

// saving aggregate
await repository.save(order)

// loading aggregate
const order = await repository.load<Order>('myshop.order', 4271983)
```