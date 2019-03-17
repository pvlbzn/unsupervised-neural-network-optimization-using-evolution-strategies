<template>
<div>
  <div class="ui input">
    <input type="text" placeholder="# of agents" v-model="nAgents">
  </div>
  <div class="ui input">
    <input type="text" placeholder="# of agents" v-model="nRows">
  </div>
  <div class="ui input">
    <input type="text" placeholder="# of agents" v-model="nCols">
  </div>
  <div class="ui input">
    <input type="text" placeholder="# of agents" v-model="cellSize">
  </div>
  <div class="ui input">
    <input type="text" placeholder="# of agents" v-model="speed">
  </div>
  <button class="ui button" @click="start">Start</button>
</div>
</template>

<script>
import { InputParameters } from '../../../snake/controllers/Controller.ts';


export default {
  name: 'snnake-params',

  data: () => ({
    nAgents: 20,
    nRows: 40,
    nCols: 40,
    cellSize: 16,
    speed: 100
  }),

  methods: {
    start() {
      this.$emit('start', new InputParameters(
        this.nAgents,
        this.nRows,
        this.nCols,
        this.cellSize,
        this.speed
      ))
    }
  }

}
</script>

<style>

</style>
