import { AgentState } from '@/controller/Controller';
import { Network, NetworkController } from './Network';
import { Neuron } from 'synaptic'

class EvolvingAgent { constructor(public score: number, public net: Network) {} }

export class Evolution {
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
