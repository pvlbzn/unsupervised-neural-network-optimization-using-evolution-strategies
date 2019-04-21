<template>
<div>
  <p>Number of agents</p>
  <div class="ui input">
    <input type="text" v-model="nAgents">
  </div>
  <p>Number of rows</p>
  <div class="ui input">
    <input type="text" v-model="nRows">
  </div>
  <p>Number of columns</p>
  <div class="ui input">
    <input type="text" v-model="nCols">
  </div>
  <p>Cell size</p>
  <div class="ui input">
    <input type="text" v-model="cellSize">
  </div>
  <p>Game loop speed</p>
  <div class="ui input">
    <input type="text" v-model="speed">
  </div>
  <p>Performance rating multiplier</p>
  <div class="ui input">
    <input type="text" v-model="performanceRating">
  </div>
  <p>Sample size</p>
  <div class="ui input">
    <input type="text" v-model="sampleSize">
  </div>
  <p>Partition frequency</p>
  <div class="ui input">
    <input type="text" v-model="partitionFrequency">
  </div>
  <p>Mutation chance</p>
  <div class="ui input">
    <input type="text" v-model="mutationChance">
  </div>
  <p>Mutation rate</p>
  <div class="ui input">
    <input type="text" v-model="mutationRate">
  </div>
  <p>Hidden units</p>
  <div class="ui input">
    <input type="text" v-model="hiddenUnits">
  </div>
  <p>Generation interation</p>
  <div class="ui input">
    <input type="text" v-model="iterations">
  </div>
  <button class="ui button" @click="start">Start</button>
</div>
</template>

<script>
import { InputParameters } from '../controller/Controller.ts'
import Store from '../utils/Store.ts'
import { HParams } from '@/model/Hyperparameters';


export default {
  name: 'snnake-params',

  data: () => ({
    nAgents: 20,
    nRows: 80,
    nCols: 80,
    cellSize: 10,
    speed: 25,
    performanceRating: 0.3,
    sampleSize: 0.2,
    partitionFrequency: 0.75,
    mutationChance: 0.9,
    mutationRate: 0.05,
    hiddenUnits: 32,
    iterations: 3
  }),

  methods: {
    start() {
      const params = new HParams(
        this.nAgents,
        this.nRows,
        this.nCols,
        this.cellSize,
        this.speed,
        this.performanceRating,
        this.sampleSize,
        this.partitionFrequency,
        this.mutationChance,
        this.mutationRate,
        this.hiddenUnits,
        this.iterations)

      Store.setParams(params)

      this.$emit('start')
    }
  }

}
</script>

<style>

</style>
