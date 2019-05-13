import { Controller, GameState, AgentState } from './Controller'
import { InputParameters } from './Controller'
import { Board } from '../model/Board'
import { Snake } from '../model/Snake'
import { Reward } from '../model/Reward'
import { FitnessScore } from '../model/Score'
import { NetworkController } from '../network/Network'
import Store from '../utils/Store'
import { Evolution } from '@/network/Evolution';
import { HParams } from '@/model/Hyperparameters';


export class NeturalNetworkController implements Controller {
  params: HParams

  private deadSnakes: number
  private board: Board
  private gameState: GameState
  private loop: any
  private isRunning: boolean
  private generationCount: number
  private tryNumber: number
  private startTime: Array<Date>

  constructor() {
    this.params = Store.getParams()

    this.isRunning = false
    this.deadSnakes = 0
    this.generationCount = 0
    this.tryNumber = 1
    this.gameState = new GameState()
    this.startTime = new Array<Date>()
  }

  construct(): void {
    this.registerCallbacks()
    this.initBoard()
    this.initAgents()
  }

  private initBoard() {
    this.board = new Board(this.params.numberOfRows, this.params.numberOfCols, this.params.cellSize)
      .init(<HTMLElement> document.getElementById('canvas-panel')) // TODO: move this into params
      .render([])
  }

  private initAgents() {
    for (let i = 0; i < this.params.numberOfAgents; i++) {
      const cols = this.params.numberOfCols
      const rows = this.params.numberOfRows

      const a = new Snake(i, rows, cols).init(rows, cols) // TODO: refactor xcells ycells
      const r = Reward.generate(rows, cols)
      const s = new FitnessScore(a, r)
      const n = new NetworkController(12, this.params.hiddenUnits, 3) // TODO: move this to params

      n.init()

      const state = new AgentState(a, r, s, n)

      this.gameState.add(state)
    }
  }

  private initFromNets(nets: Array<NetworkController>) {
    for (let i = 0; i < nets.length; i++) {
      const cols = this.params.numberOfCols
      const rows = this.params.numberOfRows

      const a = new Snake(i, rows, cols).init(rows, cols) // TODO: refactor xcells ycells
      const r = Reward.generate(rows, cols)
      const s = new FitnessScore(a, r)
      const n = nets[i]

      const state = new AgentState(a, r, s, n)
      
      this.gameState.add(state)
    }
  }

  private registerCallbacks() {
    Store.reactor.register('collision')
    Store.reactor.add('collision', (s: any) => {
      s.kill()
      this.deadSnakes += 1
    })

    Store.reactor.register('controllerSelectAgent')
    Store.reactor.register('controllerAgentUpdate')
    Store.reactor.register('controllerGenerationDone')
    Store.reactor.register('controllerHistoryUpdate')
    Store.reactor.register('controllerAllHistoryUpdate')
    Store.reactor.register('controllerPlayPause')

    Store.reactor.add('controllerPlayPause', () => {
      this.pause()
    })
    Store.reactor.add('controllerSelectAgent', (ids: any) => {
      this.gameState.getAgents().map((agent: any) => {
        if (agent.id === ids.newId) 
          agent.select()
        if (agent.id === ids.oldId) 
          agent.select()

        if (!this.isRunning)
          this.board.renderMany(this.gameState.getAgents())
      })
    })
  }

  run(): void {
    const gameLoop = () => {
      this.gameState.foreach((agent: AgentState) => {
        if (!agent.snake.isAlive) return
        agent.eval(this.board)
        
        Store.reactor.dispatch('controllerAgentUpdate', agent)
      })
  
      this.board.renderMany(this.gameState.getAgents())
      this.board.renderRewards(this.gameState.getRewards())
  
      if (this.deadSnakes >= this.params.numberOfAgents) {
        if (this.tryNumber >= Store.getParams().iterations) {
          Store.reactor.dispatch('controllerGenerationDone', this.gameState.getStates())
          this.stop()
          this.evolve()
        } else {
          // Back all agents to life
          this.stop()
          this.gameState.foreach((a: AgentState) => {
            a.reward = Reward.generate(this.board.x, this.board.y)
            a.score.resetPenalty()
            a.snake.reset()
          })
          this.deadSnakes = 0
          this.tryNumber += 1
          this.run()
        }
      }
    }

    this.startTime.push(new Date())
    this.isRunning = true
    this.loop = setInterval(gameLoop, this.params.speed)
  }

  stop(): void {
    this.isRunning = false
    clearInterval(this.loop)
  }

  pause(): void {
    if (this.isRunning) {
      this.stop()
    } else {
      this.run()
    }
  }

  evolve(): void {
    const avgStore = this.gameState
      .map((a: AgentState) => a.score.getScore())
      .reduce((a, b) => a + b) / this.params.numberOfAgents

    const avgTime = (() => {
      const avg = new Array()
      const now = new Date()
      this.startTime.forEach((t: Date) => avg.push(now - t))

      return avg.reduce((a, b) => a + b) / avg.length
    })()

    const avgSteps = (() => {
      const steps = this.gameState.map((a: AgentState) => a.snake.getSteps())

      return steps.reduce((a, b) => a + b) / steps.length
    })()

    const avgRewards = (() => {
      const rewards = this.gameState.map((a: AgentState) => a.snake.getRewards())

      return rewards.reduce((a, b) => a + b) / rewards.length
    })()

    Store.reactor.dispatch('controllerHistoryUpdate', { 
      generation: this.generationCount, 
      score: avgStore,
      duration: avgTime,
      steps: avgSteps,
      rewards: avgRewards
    })

    Store.reactor.dispatch('controllerAllHistoryUpdate', { 
      generation: this.generationCount, 
      scores: this.gameState.map((a: AgentState) => a.score.getScore()),
      duration: avgTime,
      steps: avgSteps,
      rewards: avgRewards
    })

    this.tryNumber = 1
    this.deadSnakes = 0
    this.generationCount += 1
    this.startTime = new Array()

    const nets = new Evolution(this.gameState.getStates()).evolve()
    this.gameState.wipe()
    this.initFromNets(nets)
    this.run()
  }
}
