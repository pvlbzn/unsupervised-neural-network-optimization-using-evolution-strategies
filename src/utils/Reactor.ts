class ReactorEvent {
  name: string
  callbacks: Array < Function >

    constructor(name: string) {
      this.name = name
      this.callbacks = []
    }

  register(f: Function): ReactorEvent {
    this.callbacks.push(f)
    return this
  }
}

class Reactor {
  events: Map < string, ReactorEvent >

    constructor() {
      this.events = new Map()
    }

  register(name: string) {
    this.events.set(name, new ReactorEvent(name))

    return this
  }

  dispatch(name: string, args: any) {
    if (this.events.has(name)) {
      const e = this.events.get(name)
      if (e !== undefined) e.callbacks.forEach(f => f(args))
    } else {
      throw new Error(`key ${name} does not exists`)
    }

    return this
  }

  add(name: string, f: Function) {
    const e = this.events.get(name)
    if (e !== undefined) e.register(f)
    else throw new Error(`no "${name}" callback exists`)

    return this
  }
}

export {
  ReactorEvent,
  Reactor
}