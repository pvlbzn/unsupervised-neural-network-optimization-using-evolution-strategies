import { FeatureSet } from '../network/Feature'


export interface Network {
  predict(fs: FeatureSet): void
  clone(): void
}

export class NetworkController {
  private availableNets: Array < string >
  private name: string
  private net: Network

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

  predict(fs: FeatureSet) {

  }
}

class N1 implements Network {
  net: any

  constructor() {
    // const x0 = new synaptic.Layer(12)
    // const x1 = new synaptic.Layer(32)
    // const x2 = new synaptic.Layer(3)

    // x0.project(x1)
    // x1.project(x2)

    // this.net = new synaptic.Network({
    //   input: x0,
    //   hidden: [x1],
    //   output: x2
    // })

    // this.randomize()
  }

  // private randomize(): void {
  //   for (let i = 0; i < this.net.layers.hidden[0].list.length; i++) {
  //     this.net.layers.hidden[0].list[i].bias = Math.random()
  //   }

  //   for (let i = 0; i < this.net.layers.output.list.length; i++) {
  //     this.net.layers.output.list[i].bias = Math.random()
  //   }
  // }

  predict(fs: FeatureSet) {
    // return this.softmax(this.net.activate(fs.features.map(x => x.value)))
  }

  clone() {

  }

  // private softmax(arr) {
  //   return arr.map((value, index) => {
  //       return Math.exp(value) / arr.map((y) => {
  //           return Math.exp(y) }).reduce((a, b) => {
  //               return a + b })})
  // }
}