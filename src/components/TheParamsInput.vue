<template>
<div style="text-align: left; margin: 1em;">
  <h3>Number of agents</h3>
  <div class="ui input">
    <input type="text" v-model="nAgents">
  </div>
  <h3>Number of rows</h3>
  <div class="ui input">
    <input type="text" v-model="nRows">
  </div>
  <h3>Number of columns</h3>
  <div class="ui input">
    <input type="text" v-model="nCols">
  </div>
  <h3>Cell size</h3>
  <div class="ui input">
    <input type="text" v-model="cellSize">
  </div>
  <h3>Game loop speed</h3>
  <div class="ui input">
    <input type="text" v-model="speed">
  </div>
  <h3>Performance rating multiplier</h3>
  <div class="ui input">
    <input type="text" v-model="performanceRating">
  </div>
  <h3>Sample size</h3>
  <div class="ui input">
    <input type="text" v-model="sampleSize">
  </div>
  <h3>Partition frequency</h3>
  <div class="ui input">
    <input type="text" v-model="partitionFrequency">
  </div>
  <h3>Mutation chance</h3>
  <div class="ui input">
    <input type="text" v-model="mutationChance">
  </div>
  <h3>Mutation rate</h3>
  <div class="ui input">
    <input type="text" v-model="mutationRate">
  </div>
  <h3>Hidden units</h3>
  <div class="ui input">
    <input type="text" v-model="hiddenUnits">
  </div>
  <h3>Generation interation</h3>
  <div class="ui input">
    <input type="text" v-model="iterations">
  </div>
  <button class="ui button" @click="start">{{ buttonString }}</button>
</div>
</template>

<script>
import { InputParameters } from '../controller/Controller.ts'
import Store from '../utils/Store.ts'
import { HParams } from '@/model/Hyperparameters';


const buttonStates = {
  'start': 0,
  'pause': 1,
}

export default {
  name: 'snnake-params',

  props: {
    isInitialized: { required: true }
  },

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
    iterations: 3,

    buttonState: buttonStates.start
  }),

  methods: {
    start() {
      if (this.isInitialized) {
        if (this.buttonState === buttonStates.start) {
          this.buttonState = buttonStates.pause
        } else {
          this.buttonState = buttonStates.start
        }
      } else {
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
        
        this.buttonState = buttonStates.pause
      }

      this.$emit('start')
    }
  },

  computed: {
    buttonString() {
      if (this.buttonState === buttonStates.start) return 'Start'
      else return 'Pause'
    }
  }

}
</script>

<style scoped>
h3 {
  color: #525252;
  font-size: 1em;
  margin-top: 1em;
  margin-bottom: 0.25em;
  margin-left: 1em;
}

.ui.input input {
  border: none;
  background: #f1f1f1;
  font-family: monospace;
}

.ui.input {
  width: 100%;
  min-width: 80px;
}

.ui.button {
  margin-top: 1em;
  width: 100%;
  min-width: 80px;
}
</style>
