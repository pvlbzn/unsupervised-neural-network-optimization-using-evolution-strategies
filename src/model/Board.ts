import Store from '../utils/Store'
import { Reward } from './Reward';


export class Board {
  x: number
  y: number
  size: number
  context: any

  constructor(x: number, y: number, size: number) {
    this.x = x
    this.y = y
    this.size = size

    this.context = null
  }

  init(parentNode: HTMLElement) {
    const c = document.createElement('canvas')
    c.id = 'board'
    parentNode.appendChild(c)

    this.context = c.getContext('2d')
    this.context.canvas.width = this.x * this.size
    this.context.canvas.height = this.y * this.size

    // FIXME: provide concrete type
    const getCell = (e: any) => {
      const x = e.layerX
      const y = e.layerY

      const cellX = Math.floor(x / this.size)
      const cellY = Math.floor(y / this.size)

      return {
        x: cellX,
        y: cellY
      }
    }

    // Initialize board events
    // Rigister left-click event
    Store.reactor.register('boardLeftClick')
    c.addEventListener('click', e => {
      Store.reactor.dispatch('boardLeftClick', getCell(e))
    })

    // Register right-click event
    Store.reactor.register('boardRightClick')
    c.addEventListener('contextmenu', e => {
      e.preventDefault()
      Store.reactor.dispatch('boardRightClick', getCell(e))
    })

    return this
  }

  _flush() {
    // Render background
    this.context.fillStyle = '#efefef'
    this.context.fillRect(0, 0, this.size * this.x, this.size * this.y)
  }

  render(nodes: any) {
    this._flush()

    // Render each node
    nodes.forEach((node: any) => {
      this.context.fillStyle = '#292929'
      this.context.fillRect(node.data.x * this.size, node.data.y * this.size, this.size, this.size)
    });

    return this
  }

  renderMany(snakes: any) {
    this._flush()

    snakes.forEach((snake: any) => {
      snake.getData().forEach((node: any) => {
        let style = ""
        if (snake.isSelected)
          style = "rgba(89, 214, 202, 0.35)"
        else if (!snake.isAlive)
          style = "rgba(255, 136, 136, 0.2)"
        else if (snake.isAlive)
          style = "rgba(41, 41, 41, 0.35)"
        else
          console.error("unknown snake state")

        this.context.fillStyle = style
        this.context.fillRect(node.data.x * this.size, node.data.y * this.size, this.size, this.size)
      })
    })
  }

  renderReward(reward: Reward) {
    this.context.fillStyle = '#72aff1'
    this.context.fillRect(reward.x * this.size, reward.y * this.size, this.size, this.size)
  }

  renderRewards(rewards: Array<Reward>) {
    rewards.forEach(reward => {
      this.context.fillStyle = '#72aff1'
      this.context.fillRect(reward.x * this.size, reward.y * this.size, this.size, this.size)
    })
  }
}