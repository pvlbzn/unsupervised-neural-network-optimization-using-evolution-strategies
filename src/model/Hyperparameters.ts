/**
 * Hyperparameters container.
 * 
 * @param performanceRating fitness modificator percent over a generation average 
 *                          performance score
 * @param sampleSize minimal percent of population to be selected for reproduction
 * @param mutationChance chance of mutation occurence
 * @param mutationRate modifier of a mutation strength
 */
export class HParams {
  constructor(
    public numberOfAgents: number,
    public numberOfRows: number,
    public numberOfCols: number,
    public cellSize: number,
    public speed: number,
    public performanceRating: number,
    public sampleSize: number,
    public partitionFrequency: number,
    public mutationChance: number,
    public mutationRate: number,
    public hiddenUnits: number,
    public iterations: number) { }
  
  static empty(): HParams {
    return new HParams(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
  }
}
