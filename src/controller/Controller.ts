import { FeatureExtractor } from '../network/Feature'
import { Reward } from '../model/Reward'
import Store from '../utils/Store'
import { NetworkController } from '@/network/Network';
import { FitnessScore } from '@/model/Score';
import { Snake } from '@/model/Snake';
import { Board } from '@/model/Board';

export interface Controller {
  construct(): void
  run(): void
  pause(): void
}

export class InputParameters {
  nagents: number
  xcells: number
  ycells: number
  csize: number
  speed: number

  constructor(
    nagents: number,
    xcells: number,
    ycells: number,
    csize: number,
    speed: number,
  ) {
    this.nagents = nagents
    this.xcells = xcells
    this.ycells = ycells
    this.csize = csize
    this.speed = speed
  }
}

export class AgentState {
  snake: Snake
  reward: Reward
  score: FitnessScore
  network: NetworkController

  constructor(snake: any, reward: any, score: any, network: any) {
    this.snake = snake
    this.reward = reward
    this.score = score
    this.network = network
  }

  eval(boardRef: any): boolean {
    this.calculateStep(boardRef)
    const isAlive = this.calculateReward(boardRef)
    
    return isAlive
  }

  private calculateStep(boardRef: any) {
    const features = new FeatureExtractor(this.snake, boardRef, this.reward).extract()
    const prediction = this.network.predict(features)

    const findNextStep = (p0: number, p1: number, p2: number) => {
      if (p0 > p1 && p0 > p2) return 2
      else if (p1 > p0 && p1 > p2) return 1
      else if (p2 > p0 && p2 > p1) return 0
      else throw new Error("unknown prediction")
    }

    const nextStep = findNextStep(prediction[0], prediction[1], prediction[2])

    if (nextStep === 1) this.snake.left()
    else if (nextStep === 2) this.snake.right()

    this.snake.step()
    this.score.makeStep()
  }

  private calculateReward(boardRef: Board): boolean {
    const head = this.snake.getHead()
    const rewardX = this.reward.x
    const rewardY = this.reward.y

    if (head.x === rewardX && head.y === rewardY) {
      this.snake.grow()
      this.reward = Reward.generate(boardRef.x, boardRef.y)
      this.score.countReward()
    } else {
      if (this.score.penalty()) {
        Store.reactor.dispatch('collision', this.snake)
      }
    }

    return true
  }
}

export class GameState {
  private agents: Array<AgentState>

  constructor() {
    this.agents = new Array()
  }

  add(a: AgentState) {
    this.agents.push(a)
  }

  foreach(f: Function) {
    this.agents.forEach((a: AgentState) => f(a))
  }

  map(f: Function) {
    return this.agents.map((a: AgentState) => f(a))
  }

  getAgents() {
    return this.agents.map((a: AgentState) => a.snake)
  }

  getRewards() {
    return this.agents.map((a: AgentState) => a.reward)
  }

  getStates() {
    return this.agents
  }

  wipe() {
    this.agents = new Array<AgentState>()
  }
}