class ReactorEvent {
  constructor(name) {
      this.name = name
      this.callbacks = []
  }

  register(f) {
      this.callbacks.push(f)

      return this
  }
}

class Reactor {
  constructor() {
      this.events = {}
  }

  register(name) {
      const event = new ReactorEvent(name)
      this.events[name] = event

      return this
  }

  dispatch(name, args) {
      this.events[name].callbacks.forEach(f => f(args))

      return this
  }

  add(name, f) {
      this.events[name].register(f)

      return this
  }
}

export { ReactorEvent, Reactor }
