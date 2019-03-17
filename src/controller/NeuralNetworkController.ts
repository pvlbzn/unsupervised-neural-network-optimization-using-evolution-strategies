import { Controller, GameState, AgentState } from "./Controller";
import { InputParameters } from "./Controller";
import Store from "../../utils/Store";
import { Board } from "../Board";
import { Snake } from "../Snake";
import { Reward } from "../Reward";
import { FitnessScore } from "../Score";
import { NetworkController } from "../../utils/networks/Network";


export class NeturalNetworkController implements Controller {
  params: InputParameters

  private deadSnakes: number
  private board: any
  private gameState: GameState
  private loop: any
  private isRunning: boolean

  constructor(params: InputParameters) {
    this.params = params

    this.isRunning = false
    this.deadSnakes = 0
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
      .init(document.getElementById('canvas-panel')) // TODO: move this into params
      .render([])
  }

  private initAgents() {
    for (let i = 0; i < this.params.nagents; i++) {
      const a = new Snake(i).init(this.params.xcells, this.params.ycells)
      const r = new Reward(this.params.xcells, this.params.ycells)
      const s = new FitnessScore(a)
      const n = new NetworkController('n1') // TODO: move this to params

      const state = new AgentState(a, r, s, n)

      this.gameState.add(state)
    }
  }

  private registerCallbacks() {
    console.log('store=', Store.reactor)
    Store.reactor.register('collision')
    Store.reactor.add('collision', (s: any) => {
      s.kill()
      this.deadSnakes += 1
    })

    Store.reactor.register('controllerSelectAgent')
    Store.reactor.register('controllerAgentUpdate')
    Store.reactor.register('controllerGenerationDone')
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
  
      if (this.deadSnakes === this.params.nagents) {
        Store.reactor.dispatch('controllerGenerationDone', this.gameState.getStates())
        console.log('TIME TO EVOLVE')
        this.stop()
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

  /**
   * Focus agent with `agentId`.
   * 
   * @param agentId 
   */
  focus(agentId: Number): void {
    // If game is running just set color property of a snake to
    // focused. If game is not running than set color property
    // to focused and re-render the board.
    
  }
}
