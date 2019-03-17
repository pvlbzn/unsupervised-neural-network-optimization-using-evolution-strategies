export class Reward {
  x: number
  y: number

  constructor(x: number, y: number) {
      this.x = Math.floor(Math.random() * x) 
      this.y = Math.floor(Math.random() * y)
  }
}
