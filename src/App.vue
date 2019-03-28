<template>
  <div id="app">
    <div class="ui grid">
      <div class="row">
        <div class="three wide column">
          <the-params-input @start="start"></the-params-input>
          <the-history :records="history"></the-history>
        </div>
        <div class="ten wide column">
          <the-game 
            v-if="isInitialized" 
            :focus="onFocus"
            @update="agentUpdate"
            @generation="historyUpdate"
            @done="agentsUpdate"
          ></the-game>
        </div>
        <div class="three wide column">
          <the-table :agents="agents" @focus="focus"></the-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import TheParamsInput from './components/TheParamsInput'
import TheGame from './components/TheGame'
import TheTable from './components/TheTable'
import TheHistory from './components/TheHistory'
import { InputParameters } from './controller/Controller'


export default Vue.extend({
  name: 'snnake-app',

  components: {
    TheParamsInput,
    TheGame,
    TheTable,
    TheHistory
  },

  data: () => ({
    isInitialized: false,

    agents: [],
    history: [],
    onFocus: -1,
  }),

  methods: {
    start() {
      this.isInitialized = true
    },

    agentUpdate(agent) {
      const elem = this.agents.filter(x => x.id === agent.snake.id)
      
      if (elem.length !== 0) {
        elem[0].score = agent.score.getScore()
        elem[0].alive = agent.snake.isAlive
      } else {
        this.agents.push({
          id: agent.snake.id, 
          score: agent.score.getScore(),
          alive: agent.snake.isAlive
        })
      }
    },

    agentsUpdate(agentsObj) {
      const tmp = []

      agentsObj.forEach(agent => {
        tmp.push({
          id: agent.snake.id,
          score: agent.score.getScore(),
          alive: agent.snake.isAlive
        })
      })

      tmp.sort((a, b) => {
        const ascore = a.score
        const bscore = b.score

        if (ascore > bscore) return -1
        else if (ascore < bscore) return 1
        else 0
      })

      this.agents = tmp
    },

    historyUpdate(h) {
      console.log(`generation = ${h.generation} score = ${h.score}`)
      this.history.push(h)
    },

    focus(agentId) {
      this.onFocus = agentId
    }
  }
});
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
