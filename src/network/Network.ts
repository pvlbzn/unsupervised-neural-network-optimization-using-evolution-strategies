import { FeatureSet } from '../network/Feature'
import { Weights } from './Evolution';
import { TypedArray } from '@tensorflow/tfjs-core/dist/types';

import _ from 'lodash'

import * as tf from '@tensorflow/tfjs'


export interface Network {
  // net: any
  inputWeights: tf.Tensor
  outputWeights: tf.Tensor

  predict(fs: FeatureSet): any
  clone(): void
  print(): void
}

export class NetworkController {
  private net: Network

  constructor(public input: number, public hidden: number, public output: number) { }

  setNetwork(n: Network): void {
    this.net = n
  }

  init() {
    this.net = new N2(this.input, this.hidden, this.output)
  }

  getInputWeights() {
    return this.net.inputWeights
  }

  getOutputWeights() {
    return this.net.outputWeights
  }

  static createNewFromWeights(w: Weights, input: number, hidden: number, output: number): NetworkController {
    // FIXME: optimization needed
    const n = new N2(input, hidden, output)

    console.log('created net n = ', n)
    console.log('w = ', w)
    console.log('\n\n')

    n.inputWeights = tf.tensor(w.in, n.inputWeights.shape)
    n.outputWeights = tf.tensor(w.out, n.outputWeights.shape)

    const nc = new NetworkController(input, hidden, output)
    nc.setNetwork(n)

    return nc
  }

  predict(fs: FeatureSet): Array<number> {
    return this.net.predict(fs)
  }
}

// class N1 implements Network {
//   net: any
//   lib: any

//   constructor() {
//     this.lib = window.synaptic

//     const x0 = new this.lib.Layer(12)
//     const x1 = new this.lib.Layer(32)
//     const x2 = new this.lib.Layer(3)

//     x0.project(x1)
//     x1.project(x2)

//     this.net = new this.lib.Network({
//       input: x0,
//       hidden: [x1],
//       output: x2
//     })

//     this.randomize()
//   }

//   clone() {

//   }

//   private randomize(): void {
//     // const w1 = tf.randomUniform([1, 32]).arraySync()[0]
//     for (let i = 0; i < this.net.layers.hidden[0].list.length; i++) {
//       this.net.layers.hidden[0].list[i].activation = _.random(0,1, true)
//       this.net.layers.hidden[0].list[i].bias = 0
//     }

//     // const w2 = tf.randomUniform([1, 3]).arraySync()[0]
//     for (let i = 0; i < this.net.layers.output.list.length; i++) {
//       this.net.layers.output.list[i].activation = _.random(0,1, true)
//       this.net.layers.output.list[i].bias = 0
//     }
//   }

//   print(): void {
//     let x0 = '<'
//     this.net.layers.input.list.forEach((n: Neuron) => {
//       x0 += `${n.activation} `
//     })
//     x0 += '>'

//     let hidden = '<'
//     this.net.layers.hidden.forEach((l: Layer) => {
//       hidden += '\n<'
//       l.list.forEach((n: Neuron) => {
//         hidden += `${n.activation} `
//       })
//       hidden += '>'
//     })
//     hidden += '\n>'

//     let xN = '<'
//     this.net.layers.output.list.forEach((n: Neuron) => {
//       xN += `${n.activation} `
//     })
//     xN += '>'

//     const res = x0 + '\n' + hidden + '\n' + xN

//     console.log(res)
//   }

//   predict(fs: FeatureSet): Array<number> {
//     const inputVector = fs.features.map(x => x.value)
//     this.net.layers.input.activate(inputVector)
//     const p = this.softmax(this.net.activate(inputVector))

//     fs.print(true)

//     return p
//   }

//   private softmax(arr: any) {
//     return arr.map((value: any, index: any) => {
//         return Math.exp(value) / arr.map((y: any) => {
//             return Math.exp(y) }).reduce((a: any, b: any) => {
//                 return a + b })})
//   }
// }

class N2 implements Network {
  input: number
  hidden: number
  output: number

  inputWeights: tf.Tensor
  outputWeights: tf.Tensor

  constructor(input: number, hidden: number, output: number) {
    this.input = input
    this.hidden = hidden
    this.output = output

    tf.setBackend('cpu')

    this.inputWeights = tf.randomNormal([this.input, this.hidden])
    this.outputWeights = tf.randomNormal([this.hidden, this.output])
  }

  predict(fs: FeatureSet) {
    let out: TypedArray = new Float32Array

    tf.tidy(() => {
      let x0 = tf.tensor(fs.features.map(f => f.value), [1, this.input])
      let x1 = x0.matMul(this.inputWeights).sigmoid()
      let x2 = x1.matMul(this.outputWeights).softmax()
      out = x2.dataSync()
    })

    return out
  }

  clone() {
    let dup = new N2(this.input, this.hidden, this.output)

    dup.cleanup()

    dup.inputWeights = tf.clone(this.inputWeights)
    dup.outputWeights = tf.clone(this.outputWeights)

    return dup
  }

  print() {
    const iw = this.inputWeights.toString()
    const ow = this.outputWeights.toString()

    console.log(`<N2(\n iw=${iw} \n ow=${ow})>`)
  }

  cleanup() {
    this.inputWeights.dispose()
    this.outputWeights.dispose()
  }
}