/**
* Feature extractor.
* 
* Extracts features from the snake and its environment. It implements
* Extractor interface which defines extract method which returns FeatureSet
* which is used in neural network as an input parameters.
* 
* Feature extractor is more like a wrapper class over different experiments.
* This modularity gives flexibility, namely quick extractor change depending
* on the experiment running.
*/
export class FeatureExtractor implements Extractor {
  e: Extractor
  constructor(public agent: object, public environment: object, public reward: object) { 
      this.e = new E1(agent, environment, reward)
  }

  extract(): FeatureSet {
      return this.e.extract()
  }
}

export class Feature {
  constructor(public key: string, public value: number) {}

  toString(): string {
      return `key=${this.key} value=${this.value}`
  }
}

export class FeatureSet {
  public units: number

  constructor(public features: Feature[]) {
      this.units = features.length
  }

  add(another: FeatureSet): FeatureSet {
      return new FeatureSet(this.features.concat(another.features))
  }
}

interface Extractor {
  extract(): FeatureSet
}

/**
* Extractor experiment 1
* 
* E1 extracts basic things needed for survival - navigation and food location:
*  - collision on left
*  - collision on right
*  - collision on up
*  - collision on down
*  - direction left
*  - direction right
*  - direction up
*  - direction down
*  - food on left
*  - food on right
*  - food on up
*  - food on down
*/
class E1 implements Extractor {
  constructor(public agent: any, public environment: any, public reward: any) {}

  private extractNavigation(): FeatureSet {
      const s = this.agent

      const cr = s.isCollisionOn(0) ? 1 : 0
      const cd = s.isCollisionOn(1) ? 1 : 0
      const cl = s.isCollisionOn(2) ? 1 : 0
      const cu = s.isCollisionOn(3) ? 1 : 0

      const dr = s.direction === 0 ? 1 : 0
      const dd = s.direction === 1 ? 1 : 0
      const dl = s.direction === 2 ? 1 : 0
      const du = s.direction === 3 ? 1 : 0

      return new FeatureSet([
          new Feature('collisionRight', cr),
          new Feature('collisionDown', cd),
          new Feature('collisionLeft', cl),
          new Feature('collisionUp', cu),
          new Feature('directionRight', dr),
          new Feature('directionDown', dd),
          new Feature('directionLeft', dl),
          new Feature('directionUp', du),
      ])
  }

  private extractReward(): FeatureSet {
      const head = this.agent.getHead()
      const reward = this.reward

      const rx = reward.x
      const ry = reward.y

      const hx = head.x
      const hy = head.y

      const fr = hx < rx ? 1 : 0
      const fd = hy < ry ? 1 : 0
      const fl = hx > rx ? 1 : 0
      const fu = hy > ry ? 1 : 0

      return new FeatureSet([
          new Feature('foodRight', fr),
          new Feature('foodDown', fd),
          new Feature('foodLeft', fl),
          new Feature('foodUp', fu)
      ])
  }

  extract(): FeatureSet {
      return this.extractNavigation().add(this.extractReward())
  }
}