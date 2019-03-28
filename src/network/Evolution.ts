import { NetworkController } from './Network';
import { TypedArray } from '@tensorflow/tfjs-core/dist/types';
import { AgentState } from '@/controller/Controller';

import _ from 'lodash'
import Store from '@/utils/Store';

class EvolvingAgent { 
  constructor(public score: number, public nc: NetworkController) {}
}

interface Evolver {
  evolve(): Array<NetworkController>
}

export class Evolution implements Evolver {
  private engine: Evolver

  constructor(private agents: Array<AgentState>) {
    this.engine = new TFEvolver(agents)
  }

  evolve() {
    return this.engine.evolve()
  }
}

export type Weights = { in: TypedArray, out: TypedArray }
type Partitioned = { in: Array<TypedArray>, out: Array<TypedArray> }
type Schema = { in: Array<number>, out: Array<number> }

class TFEvolver implements Evolver {
  constructor(private agents: Array<AgentState>) {}

  evolve() {
    const input = this.agents[0].network.input
    const hidden = this.agents[0].network.hidden
    const output = this.agents[0].network.output

    const performanceRating = Store.getParams().performanceRating
    const sampleSize = Store.getParams().sampleSize

    // Get sample agents from which new agents will be generated
    const selected = this.select(performanceRating, Math.floor(this.agents.length * sampleSize))
    const newGeneration = this.generate(selected)

    const newNets = newGeneration.map(w => 
      NetworkController.createNewFromWeights(w, input, hidden, output))

    return newNets
  }

  /**
   * 
   * @param performanceRating value of performance which will be selected from "above average"
   *                          e.g. if average score is 100, 0.25 will return agents with score
   *                          above of 125
   * @param minSampleSize minimum number of agents to be returned
   */
  private select(performanceRating: number, minSampleSize: number): Array<EvolvingAgent> {
    const sortedEvolvingAgents = this.agents
      .map(agent => new EvolvingAgent(agent.score.getScore(), agent.network))
      .sort((a , b) => {
        if (a.score > b.score) return -1
        else if (a.score < b.score) return 1
        else return 0
      })
    
    // Sum of all scores over a generation
    const scoreSum = sortedEvolvingAgents
      .map(ea => ea.score)
      .reduce((a, b) => a + b)
    
    const averageScore = scoreSum / this.agents.length

    // It could be the case when selected length would be 0:
    // All agents died with score of 10.
    const selected = sortedEvolvingAgents
      .filter(ea => ea.score > averageScore + (averageScore * performanceRating))

    if (selected.length < minSampleSize) {
      console.warn(`selected.length = ${selected.length} while minimum sample size ${minSampleSize}`)
      const candidates = sortedEvolvingAgents
        .filter(ea => ea.score <= averageScore + (averageScore * performanceRating))

      for (let i = 0; i < minSampleSize - selected.length; i++) {
        selected.push(candidates[i])
      }
    }

    return selected
  }

  private generate(ea: Array<EvolvingAgent>) {
    // Find how many new agents should be generated
    const missing = this.agents.length - ea.length

    // Extract neural network weights. Data should have a shape of
    // { in: Array<number>, out: Array<number> } 
    const rawNets = this.extractWeights(ea)

    const newAgents = []
    
    // Add parents back to generation set
    rawNets.forEach(n => newAgents.push(n))

    for (let i = 0; i < missing; i++) {
      const parents: Array<Weights> = this.pickTwo(rawNets)
      const partitionSchema: Schema = this.findPartitionSchema(parents[0])
      const p1 = this.partition(parents[0], partitionSchema)
      const p2 = this.partition(parents[1], partitionSchema)
      const agent = this.produce(p1, p2)

      newAgents.push(agent)
    }

    // Mutate all
    const mutated = []
    newAgents.forEach(a => mutated.push(this.mutate(a)))

    return newAgents
  }

  private pickTwo(arr: Array<Weights>): Array<Weights> {
    const r1 = _.random(0, arr.length - 1)
    let r2 = _.random(0, arr.length - 1)

    if (r1 === r2) {
      do {
        r2 = _.random(0, arr.length - 1)
      } while (r1 !== r2)
    }

    return [arr[r1], arr[r2]]
  }

  // Transform agents into plain neural network weights
  private extractWeights(ea: Array<EvolvingAgent>): Array<Weights> {
    const weights = ea.map(a => {
      return { in: a.nc.getInputWeights().dataSync(), out: a.nc.getOutputWeights().dataSync() }
    })

    return weights
  }

  private partition(w: Weights, schema: Schema): Partitioned {
    const parts: Partitioned = { in: [], out: [] }
    let lastIn = 0
    let lastOut = 0

    for (let i = 0; i < schema.in.length + 1; i++) {
      parts.in.push(w.in.slice(lastIn, schema.in[i]))
      lastIn = schema.in[i]
    }

    for (let i = 0; i < schema.out.length + 1; i++) {
      parts.out.push(w.out.slice(lastOut, schema.out[i]))
      lastOut = schema.out[i]
    }

    return parts
  }

  private findPartitionSchema(arr: Weights): Schema {
    const schema: Schema = { in: [], out: [] }

    for (let i = 1; i < arr.in.length; i++) {
      const chance = Math.random()

      if (chance > Store.getParams().partitionFrequency) {
        schema.in.push(i)
      }
    }

    for (let i = 1; i < arr.out.length; i++) {
      const chance = Math.random()

      if (chance > Store.getParams().partitionFrequency) {
        schema.out.push(i)
      }
    }

    return schema
  }

  private produce(aw: Partitioned, bw: Partitioned): Weights {
    const inw: Array<number> = []
    const outw: Array<number> = []

    for (let i = 0; i < aw.in.length; i++) {
      if (i % 2 === 0) aw.in[i].forEach((x: number) => inw.push(x))
      else bw.in[i].forEach((x: number) => inw.push(x))
    }

    for (let i = 0; i < aw.out.length; i++) {
      if (i % 2 === 0) aw.out[i].forEach((x: number) => outw.push(x))
      else bw.out[i].forEach((x: number) => outw.push(x))
    }
    
    const res = { in: Float32Array.from(inw), out: Float32Array.from(outw) }

    return res
  }

  private mutate(w: Weights): Weights {
    for (let i = 0; i < w.in.length; i++) {
      if(Math.random() > Store.getParams().mutationChance) {
        if (Math.random() > 0.5) {
          w.in[i] = w.in[i] + (Math.random() * Store.getParams().mutationRate)
        } else {
          w.in[i] = w.in[i] - (Math.random() * Store.getParams().mutationRate)
        }
      }
    }

    for (let i = 0; i < w.out.length; i++) {
      if(Math.random() > Store.getParams().mutationChance) {
        if (Math.random() > 0.5) {
          w.out[i] = w.out[i] + (Math.random() * Store.getParams().mutationRate)
        } else {
          w.out[i] = w.out[i] - (Math.random() * Store.getParams().mutationRate)
        }
      }
    }

    return w
  }

}