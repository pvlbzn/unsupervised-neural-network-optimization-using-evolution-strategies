import _ from "lodash"

export class Reward {
  constructor(public x: number, public y: number) { }

  static generate(xlimit: number, ylimit: number): Reward {
    const x = _.random(0, xlimit - 1)
    const y = _.random(0, ylimit - 1)

    return new Reward(x, y)
  }
}
