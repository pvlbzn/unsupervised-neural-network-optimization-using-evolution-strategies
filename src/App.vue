<template>
  <div id="app">
    <div class="ui grid">
      <div class="row">
        <div class="three wide column">
          <the-params-input @start="start"></the-params-input>
        </div>
        <div class="thirteen wide column" style="display: flex; align-items: center; justify-content: center;">
          <the-game 
            v-if="isInitialized" 
            :focus="onFocus"
            @update="agentUpdate"
            @generation="historyUpdate"
            @generationAll="allHistoryUpdate"
            @done="agentsUpdate"
          ></the-game>
        </div>
      </div>

      <div class="row" style="margin: 1em;">
        <div class="six wide column">
          <div style="text-align: center;">
            <the-summary
              v-if="isInitialized"
              :history="allHistory"
            ></the-summary>
          </div>
        </div>
        <div class="ten wide column">
          <the-chart
            v-if="isInitialized && agents.length != 0"
            :nagents="agents.length"
            :history="allHistory"
          ></the-chart>
        </div>
      </div>

      <div class="row" style="margin: 1em;">
        <div class="sexteen wide column">
          <the-history 
            :records="history"
          ></the-history>
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
import TheChart from './components/TheChart'
import TheSummary from './components/TheSummary'

import { InputParameters } from './controller/Controller'


export default Vue.extend({
  name: 'snnake-app',

  components: {
    TheParamsInput,
    TheGame,
    TheTable,
    TheHistory,
    TheChart,
    TheSummary
  },

  data: () => ({
    isInitialized: false,

    agents: [],
    history: [],
    allHistory: [],
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
      this.history.push(h)
    },

    allHistoryUpdate(h) {
      this.allHistory.push(h)
    },

    focus(agentId) {
      this.onFocus = agentId
    }
  }
});
</script>

<style>
@import url('https://rsms.me/inter/inter.css');
html { font-family: 'Inter', sans-serif; }
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', sans-serif; }
}

* {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4, h5, h6, p, span {
  font-family: 'Inter', sans-serif;
}

#app {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

</style>
