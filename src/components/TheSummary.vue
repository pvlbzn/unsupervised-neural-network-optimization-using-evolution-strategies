<template>
  <div class="ui grid summary" style="margin: auto;">
    <div class="row">
      <div class="column">
        <h1 class="summary__header">Summary</h1>
      </div>
    </div>

    <div class="row">
      <div class="eight wide column">
        <h3 class="summary__subheader">Environment</h3>
        <p class="summary__body">Population size: <span>{{ params.numberOfAgents }}</span></p>
        <p class="summary__body">Board: <span>{{ params.numberOfRows }} x {{ params.numberOfCols }}</span></p>
        <p class="summary__body">Performance rating: <span>{{ params.performanceRating }}</span></p>
        <p class="summary__body">Sample size: <span>{{ params.sampleSize }}</span></p>
        <p class="summary__body">Partition frequency: <span>{{ params.partitionFrequency }}</span></p>
        <p class="summary__body">Mutation chance: <span>{{ params.mutationChance }}</span></p>
        <p class="summary__body">Mutation rate: <span>{{ params.mutationRate }}</span></p>
        <p class="summary__body">Hidden units: <span>{{ params.hiddenUnits }}</span></p>
      </div>
      <div class="eight wide column">
        <h3 class="summary__subheader">Session</h3>
        <p class="summary__body">Generation number: <span>{{ history.length }}</span></p>
        <p class="summary__body">Current duration: <span>{{ t2 }}</span></p>
        <p class="summary__body">Avg change of steps: <span :class="stepDiffClass">{{ stepDiffString }}</span></p>
        <p class="summary__body">Avg change of rewards: <span :class="rewardDiffClass">{{ rewardDiffString }}</span></p>
        <p class="summary__body">Avg change life duration: <span :class="durationDiffClass">{{ durationDiffString }}</span></p>
      </div>
    </div>
  </div>
</template>

<script>
// Session summary
// Current session:
//    - hyperparameters
//    - environment setup
//    - net architecture
// Generation:
//    - current generation #
//    - current generation state
//    - current trend
import Store from '../utils/Store.ts'


export default {
  props: {
    history: { required: true }
  },

  data: () => ({
    params: Store.getParams(),
    
    t1: new Date(),
    t2:  0,

    stepDiff: 0,
    rewardDiff: 0,
    durationDiff: 0,
  }),

  mounted: function() {
    setInterval(() => {
      this.t2 = new Date() - this.t1
    }, 100)
  },

  watch: {
    history() {
      this.t1 =  new Date()

      const modulo = (a) => {
        if (a > 0) return a
        else return -a
      }

      const percentageDiff = (a, b) => {
        const n = modulo(a - b)
        const d = (a + b) / 2

        if (a > b) {
          return n / d * 100
        } else {
          return -(n / d * 100)
        }
      }

      if (this.history.length >= 2) {
        const prev = this.history[this.history.length - 2]
        const curr = this.history[this.history.length - 1]

        this.stepDiff = Math.floor(percentageDiff(curr.steps, prev.steps))
        this.durationDiff = Math.floor(percentageDiff(curr.duration, prev.duration))
        this.rewardDiff = Math.floor(percentageDiff(curr.rewards, prev.rewards))
      }
    }
  },

  computed: {
    stepDiffString() {
      if (this.stepDiff > 0) {
        return `+${this.stepDiff}%`
      } else if (this.stepDiff === 0) {
        return '0%'
      } else {
        return `-${this.stepDiff * -1}%`
      }
    },

    stepDiffClass() {
      if (this.stepDiff > 0) {
        return ' positive '
      } else if (this.stepDiff === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    },

    durationDiffString() {
      if (this.durationDiff > 0) {
        return `+${this.durationDiff}%`
      } else if (this.durationDiff === 0) {
        return '0%'
      } else {
        return `-${this.durationDiff * -1}%`
      }
    },

    durationDiffClass() {
      if (this.durationDiff > 0) {
        return ' positive '
      } else if (this.durationDiff === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    },

    rewardDiffString() {
      if (this.rewardDiff > 0) {
        return `+${this.rewardDiff}%`
      } else if (this.rewardDiff < 0) {
        return `-${this.rewardDiff * -1}%`
      } else {
        return `0%`
      }
    },

    rewardDiffClass() {
      if (this.rewardDiff > 0) {
        return ' positive '
      } else if (this.rewardDiff === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    }
  }
}
</script>

<style scoped>
.summary {
  background: #F4F4F4;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  min-width: 250px;
  text-align: left;
  padding: 2em;
}

.summary__header {
  color: #676767;
  font-weight: bold;
  font-size: 20px;
}

.summary__subheader {
  color: #676767;
  font-weight: bold;
  font-size: 16px;
}

.summary__body {
  font-weight: 400;
  font-size: 14px;
}

p span {
  font-family: monospace;
  font-weight: bold;
}

.positive {
  color: green;
}

.neutral {
  color: #2c3e50;
}

.negative {
  color: red;
}
</style>
