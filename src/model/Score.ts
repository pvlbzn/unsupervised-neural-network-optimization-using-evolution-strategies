import { Snake, Node } from './Snake'
import { Reward } from './Reward'

interface Experiment {
  getScore(): number
  makeStep(): void
  countReward(): void
  penalty(): boolean
  resetPenalty(): void
}

/**
 * Snake's fitness score.
 * 
 * Each snake may have a fitness score, a meause with wich we can
 * describe how well snake performed. Fitness score may have numerous
 * variations.
 * 
 * Concepts:
 *      Time:
 *          Time is non-relevant metric. Snake, like a processor, has a clock,
 *          or steps. Therefore the length of existence can be calculated by
 *          a number of steps performed. Standard time units like seconds are
 *          irrelevant. Moreover, since the runtime is async time units can not
 *          be used as an adequate measure.
 * 
 */
export class FitnessScore implements Experiment {
  private experiment: Experiment

  constructor(public snake: Snake, public reward: Reward) {
    this.experiment = new Experiment4(snake, reward)
  }

  getScore(): number {
    return this.experiment.getScore()
  }

  makeStep(): void {
    this.experiment.makeStep()
  }

  countReward(): void {
    this.experiment.countReward()
  }

  penalty(): boolean {
    return this.experiment.penalty()
  }

  resetPenalty(): void {
    this.experiment.resetPenalty()
  }
}

/**
 * Experiment 1
 * 
 * Main idea is to not die. The "not dying" score could be calculated
 * by simple number of steps snake performed. More steps means more
 * time without dying.
 */
// class Experiment1 implements Experiment {
//   snake: object
//   score: number

//   constructor(snake: object) {
//       this.snake = snake
//       this.score = 0
//   }

//   getScore(): number {
//       return this.score
//   }

//   makeStep(): void {
//       this.score += 1
//   }

//   countReward(): void {
//       this.score += 1000
//   }

//   penalty(): boolean { return false }
// }


/**
* Experiment 2
// */
// class Experiment2 implements Experiment {
//   snake: object
//   score: number

//   constructor(snake: object) {
//       this.snake = snake
//       this.score = 1000
//   }

//   getScore(): number {
//       return this.score
//   }

//   makeStep(): void {
//       this.score -= 1
//   }

//   countReward(): void {
//       this.score += 1000
//   }

//   penalty(): boolean { return false }
// }

/**
 * Experiment 3
 */
class Experiment3 implements Experiment {
  snake: object
  score: number
  energy: number

  constructor(snake: object) {
    this.snake = snake
    this.score = 0
    this.energy = 300
  }

  getScore(): number {
    return this.score
  }

  makeStep(): void {
    this.score += 1
    this.energy -= 1
  }

  countReward(): void {
    this.score += 250
    this.energy += 100
  }

  penalty(): boolean {
    if (this.energy <= 0) return true
    else return false
  }

  resetPenalty(): void {
    this.energy = 300
  }
}

/**
 * Experiment 4: snake rewarded for moving closer to food
 * and punished for moving away from it.
 */
class Experiment4 implements Experiment {
  score: number
  energy: number
  lastDistance: number

  constructor(public snake: Snake, public reward: Reward) {
    this.score = 0
    this.energy = 80*3
    this.lastDistance = Number.MAX_SAFE_INTEGER
  }

  getScore(): number {
    return this.score
  }

  makeStep(): void {
    const d = this.computeDistance()

    if (d < this.lastDistance) {
      this.score += 5
      this.energy -= 1
    } else {
      this.score += 1
      this.energy -= 3
    }

    this.lastDistance = d
  }

  private computeDistance() {
    const headCoord = <Node> this.snake.getHead()
    
    const xDifference = Math.abs(headCoord.x - this.reward.x)
    const yDifference = Math.abs(headCoord.y - this.reward.y)

    const distance = Math.sqrt(
      Math.pow((xDifference), 2) +
      Math.pow((yDifference), 2))
    
    const maxDistance = Math.sqrt(
        Math.pow((headCoord.maxX), 2) +
        Math.pow((headCoord.maxY), 2))
    
    const scaledDistance = (1 - 0) / (maxDistance - 0) * (distance - maxDistance) + 1

    return scaledDistance
  }

  countReward(): void {
    this.score += 500
    this.energy += 100
  }

  penalty(): boolean {
    if (this.energy <= 0) return true
    else return false
  }

  resetPenalty(): void {
    this.energy = 80*3
  }
}
