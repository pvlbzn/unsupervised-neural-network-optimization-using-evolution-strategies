import { AgentState } from '@/controller/Controller';
import { Network, NetworkController } from './Network';
import { Neuron } from 'synaptic'
import _ from 'lodash'

class EvolvingAgent { 
  constructor(public score: number, public net: Network) {} 

}

interface Evolver {
  evolve(): Array<NetworkController>
}

export class Evolution implements Evolver {
  private engine: Evolver

  constructor(private agents: Array<AgentState>) {
    this.engine = new RichEvolver(agents)
  }

  evolve() {
    return this.engine.evolve()
  }
}

class PrimitiveEvolver implements Evolver {
  constructor(private agents: Array<AgentState>) {}

  evolve() {
    const targets = this.transform()

    const a = targets[0]
    const b = targets[1]
    
    // New weights of a size of a population
    const weights = []
    
    // Loop agents.length times to generate a new population set
    for (let i = 0; i < this.agents.length; i++) {
      const aw = a.net.net.layers.hidden[0].list.map((x: Neuron) => x.activation)
      const partitionSchema = this.findChunks(aw)
      const aparts = this.partition(aw, partitionSchema)
  
      const bw = b.net.net.layers.hidden[0].list.map((x: Neuron) => x.activation)
      const bparts = this.partition(bw, partitionSchema)
  
      const abw = this.produce(aparts, bparts)
      const abwm = this.mutate(abw)

      console.log(`parent a: ${aw}`)
      console.log(`parent b: ${bw}`)
      console.log(`child c: ${abwm}`)

      weights.push(abwm)
    }

    const nets = []

    // For each new agent weight initialize a network from its weigths
    for (let i = 0; i < weights.length; i++) {
      nets.push(NetworkController.createNewFromWeights(weights[i], 'n1'))
    }
    
    return nets
  }

  // Select top performers
  private transform() {
    const targets = this.agents
      .map(agent => new EvolvingAgent(agent.score.getScore(), agent.network.net))
      .sort((a , b) => {
        if (a.score > b.score) return -1
        else if (a.score < b.score) return 1
        else return 0
      })
    
    return targets
  }

  private partition(w: Array<number>, schema: Array<number>): Array<Array<number>> {
    const chunks = []
    let last = 0

    for (let i = 0; i < schema.length + 1; i++) {
      chunks.push(w.slice(last, schema[i]))
      last = schema[i]
    }

    return chunks
  }

  private findChunks(arr: Array<number>): Array<number> {
    // Find partition schema. It will be repeated on both parents.
    const schema = []

    for (let i = 1; i < arr.length; i++) {
      const chance = Math.random()

      if (chance > 0.65) {
        schema.push(i)
      }
    }

    return schema
  }

  private produce(aw: Array<Array<number>>, bw: Array<Array<number>>): Array<number> {
    const res: Array<number> = []

    for (let i = 0; i < aw.length; i++) {
      if (i % 2 === 0) {
        aw[i].forEach(x => res.push(x))
      } else {
        bw[i].forEach(x => res.push(x))
      }
    }

    return res
  }

  private mutate(w: Array<number>): Array<number> {
    for (let i = 0; i < w.length; i++) {
      // Basically 10% chance of mutation with 5% noise
      if (Math.random() > 0.8) {
        if (Math.random() > 0.5) {
          w[i] = w[i] + (Math.random() * 0.05)
        } else {
          w[i] = w[i] - (Math.random() * 0.05)
        }
      }
    }

    return w
  }

}


class RichEvolver implements Evolver {
  constructor(private agents: Array<AgentState>) {}

  evolve() {
    const performanceRating = 0.25
    const sampleSize = 0.25

    // Get sample agents from which new agents will be generated
    const selected = this.select(performanceRating, Math.floor(this.agents.length * sampleSize))
    const newGeneration = this.generate(selected)

    const newNets = newGeneration.map(a => NetworkController.createNewFromWeights(a, 'n1'))

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
      .map(agent => new EvolvingAgent(agent.score.getScore(), agent.network.net))
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

    const rawNets = this.extractNetworks(ea)

    const newAgents = []
    
    // Add parents back to generation set
    rawNets.forEach(n => newAgents.push(n))

    for (let i = 0; i < missing; i++) {
      const parents = this.pickTwo(rawNets)
      const partitionSchema = this.findPartitionSchema(parents[0])
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

  private pickTwo(arr: Array<Array<number>>): Array<Array<number>> {
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
  private extractNetworks(ae: Array<EvolvingAgent>): Array<Array<number>> {
    return ae.map(a => a.net.net.layers.hidden[0].list.map((x: Neuron) => x.activation))
  }

  private partition(w: Array<number>, schema: Array<number>): Array<Array<number>> {
    const chunks = []
    let last = 0

    for (let i = 0; i < schema.length + 1; i++) {
      chunks.push(w.slice(last, schema[i]))
      last = schema[i]
    }

    return chunks
  }

  private findPartitionSchema(arr: Array<number>): Array<number> {
    const schema = []

    for (let i = 1; i < arr.length; i++) {
      const chance = Math.random()

      if (chance > 0.75) {
        schema.push(i)
      }
    }

    return schema
  }

  private produce(aw: Array<Array<number>>, bw: Array<Array<number>>): Array<number> {
    const res: Array<number> = []

    for (let i = 0; i < aw.length; i++) {
      if (i % 2 === 0) {
        aw[i].forEach(x => res.push(x))
      } else {
        bw[i].forEach(x => res.push(x))
      }
    }

    return res
  }

  private mutate(w: Array<number>): Array<number> {
    for (let i = 0; i < w.length; i++) {
      if (Math.random() > 0.9) {
        if (Math.random() > 0.5) {
          w[i] = w[i] + (Math.random() * 0.05)
        } else {
          w[i] = w[i] - (Math.random() * 0.05)
        }
      }
    }

    return w
  }

}
