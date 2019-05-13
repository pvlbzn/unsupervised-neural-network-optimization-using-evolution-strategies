import { FeatureSet } from '../network/Feature'
import { Weights } from './Evolution';
import { TypedArray } from '@tensorflow/tfjs-core/dist/types';

import _ from 'lodash'

import * as tf from '@tensorflow/tfjs'


export interface Network {
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
  }

  cleanup() {
    this.inputWeights.dispose()
    this.outputWeights.dispose()
  }
}
