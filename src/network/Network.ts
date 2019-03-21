import { FeatureSet } from '../network/Feature'
import { Neuron, Layer } from 'synaptic'


export interface Network {
  net: any

  predict(fs: FeatureSet): Array<number>
  clone(): void
  print(): void
}

export class NetworkController {
  private availableNets: Array<string>
  private name: string
  net: Network

  constructor(name: string) {
    this.name = name
    this.availableNets = ['n1']
    this.checkName()

    this.net = new N1()
  }

  private checkName() {
    const n = this.availableNets.filter((x: string) => x === this.name)

    if (n.length === 1) return true
    else throw new Error(`network ${this.name} not found, available networks are ${this.availableNets}`)
  }

  static createNewFromWeights(w: Array<number>, name: string): NetworkController {
    const nc = new NetworkController(name)
    
    for (let i = 0; i < nc.net.net.layers.hidden[0].size; i++) {
      nc.net.net.layers.hidden[0].list[i].activation = w[i]
    }

    return nc
  }

  predict(fs: FeatureSet): Array<number> {
    return this.net.predict(fs)
  }
}

class N1 implements Network {
  net: any
  lib: any

  constructor() {
    this.lib = window.synaptic

    const x0 = new this.lib.Layer(12)
    const x1 = new this.lib.Layer(32)
    const x2 = new this.lib.Layer(3)

    x0.project(x1)
    x1.project(x2)

    this.net = new this.lib.Network({
      input: x0,
      hidden: [x1],
      output: x2
    })

    this.randomize()
  }

  clone() {

  }

  private randomize(): void {
    const w1 = tf.randomNormal([1, 32]).arraySync()[0]
    for (let i = 0; i < this.net.layers.hidden[0].list.length; i++) {
      this.net.layers.hidden[0].list[i].activation = w1[i]
      this.net.layers.hidden[0].list[i].bias = 0
    }

    const w2 = tf.randomNormal([1, 3]).arraySync()[0]
    for (let i = 0; i < this.net.layers.output.list.length; i++) {
      this.net.layers.output.list[i].activation = w2[i]
      this.net.layers.output.list[i].bias = 0
    }
  }

  print(): void {
    let x0 = '<'
    this.net.layers.input.list.forEach((n: Neuron) => {
      x0 += `${n.activation} `
    })
    x0 += '>'

    let hidden = '<'
    this.net.layers.hidden.forEach((l: Layer) => {
      hidden += '\n<'
      l.list.forEach((n: Neuron) => {
        hidden += `${n.activation} `
      })
      hidden += '>'
    })
    hidden += '\n>'

    let xN = '<'
    this.net.layers.output.list.forEach((n: Neuron) => {
      xN += `${n.activation} `
    })
    xN += '>'

    const res = x0 + '\n' + hidden + '\n' + xN
  }

  predict(fs: FeatureSet): Array<number> {
    const inputVector = fs.features.map(x => x.value)
    this.net.layers.input.activate(inputVector)
    const p = this.softmax(this.net.activate(inputVector))

    fs.print(true)

    return p
  }

  private softmax(arr: any) {
    return arr.map((value: any, index: any) => {
        return Math.exp(value) / arr.map((y: any) => {
            return Math.exp(y) }).reduce((a: any, b: any) => {
                return a + b })})
  }
}
