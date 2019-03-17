interface Experiment {
  getScore(): number
  makeStep(): void
  countReward(): void
  penalty(): boolean
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

  constructor(public snake: object) {
      this.experiment = new Experiment3(snake)
  }

  getScore(): number { return this.experiment.getScore() }

  makeStep(): void { this.experiment.makeStep() }

  countReward(): void { this.experiment.countReward() }

  penalty(): boolean { return this.experiment.penalty() }
}

/**
* Experiment 1
* 
* Main idea is to not die. The "not dying" score could be calculated
* by simple number of steps snake performed. More steps means more
* time without dying.
*/
class Experiment1 implements Experiment {
  snake: object
  score: number

  constructor(snake: object) {
      this.snake = snake
      this.score = 0
  }

  getScore(): number {
      return this.score
  }

  makeStep(): void {
      this.score += 1
  }

  countReward(): void {
      this.score += 1000
  }

  penalty(): boolean { return false }
}


/**
* Experiment 2
*/
class Experiment2 implements Experiment {
  snake: object
  score: number

  constructor(snake: object) {
      this.snake = snake
      this.score = 1000
  }

  getScore(): number {
      return this.score
  }

  makeStep(): void {
      this.score -= 1
  }

  countReward(): void {
      this.score += 1000
  }

  penalty(): boolean { return false }
}

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
      this.energy = 100
  }

  getScore(): number {
      return this.score
  }

  makeStep(): void {
      this.score += 10
      this.energy -= 1
  }

  countReward(): void {
      this.score += 1000
      this.energy += 1000
  }

  penalty(): boolean {
      if (this.energy <= 0) return true
      else return false
  }
}
