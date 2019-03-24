import { Controller, GameState, AgentState } from './Controller'
import { InputParameters } from './Controller'
import { Board } from '../model/Board'
import { Snake } from '../model/Snake'
import { Reward } from '../model/Reward'
import { FitnessScore } from '../model/Score'
import { NetworkController } from '../network/Network'
import Store from '../utils/Store'
import { Evolution } from '@/network/Evolution';


export class NeturalNetworkController implements Controller {
  params: InputParameters

  private deadSnakes: number
  private board: Board
  private gameState: GameState
  private loop: any
  private isRunning: boolean
  private generationCount: number
  private tryNumber: number

  constructor(params: InputParameters) {
    this.params = params

    this.isRunning = false
    this.deadSnakes = 0
    this.generationCount = 0
    this.tryNumber = 0
    this.gameState = new GameState()
  }

  construct(): void {
    console.log(`registering callbacks...`)
    this.registerCallbacks()
    console.log(`initializing board...`)
    this.initBoard()
    console.log(`initializing agents...`)
    this.initAgents()
  }

  private initBoard() {
    this.board = new Board(this.params.xcells, this.params.ycells, this.params.csize)
      .init(<HTMLElement> document.getElementById('canvas-panel')) // TODO: move this into params
      .render([])
  }

  private initAgents() {
    for (let i = 0; i < this.params.nagents; i++) {
      const a = new Snake(i, this.params.xcells, this.params.ycells).init(this.params.xcells, this.params.ycells) // TODO: refactor xcells ycells
      const r = new Reward(this.params.xcells, this.params.ycells)
      const s = new FitnessScore(a)
      const n = new NetworkController('n1') // TODO: move this to params

      const state = new AgentState(a, r, s, n)

      this.gameState.add(state)
    }
  }

  private initFromNets(nets: Array<NetworkController>) {
    for (let i = 0; i < nets.length; i++) {
      const a = new Snake(i, this.params.xcells, this.params.ycells).init(this.params.xcells, this.params.ycells) // TODO: refactor xcells ycells
      const r = new Reward(this.params.xcells, this.params.ycells)
      const s = new FitnessScore(a)
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
  
      if (this.deadSnakes == this.params.nagents) {
        if (this.tryNumber >= 2) {
          Store.reactor.dispatch('controllerGenerationDone', this.gameState.getStates())
          this.stop()
          this.evolve()
        } else {
          // Back all agents to life
          console.log(`try #${this.tryNumber}`)
          this.stop()
          this.gameState.foreach((a: AgentState) => {
            a.reward = new Reward(this.board.x, this.board.y)
            a.score.resetPenalty()
            a.snake.reset()
          })
          this.deadSnakes = 0
          this.tryNumber += 1
          this.run()
        }
      }
    }

    this.isRunning = true
    this.loop = setInterval(gameLoop, this.params.speed)
  }

  stop(): void {
    this.isRunning = false
    clearInterval(this.loop)
  }

  pause(): void {
    if (this.isRunning)
      this.stop()
    else this.run()
  }

  evolve(): void {
    const avgStore = this.gameState
      .map((a: AgentState) => a.score.getScore())
      .reduce((a, b) => a + b) / this.params.nagents
    Store.reactor.dispatch('controllerHistoryUpdate', { generation: this.generationCount, score: avgStore })

    this.tryNumber = 0
    this.deadSnakes = 0
    this.generationCount += 1

    const nets = new Evolution(this.gameState.getStates()).evolve()
    this.gameState.wipe()
    this.initFromNets(nets)
    this.run()
  }
}
