<template>
<table v-if="records.length !== 0" class="ui celled table">
  <thead>
    <tr>
      <th class="table-head table__subheader">Generation</th>
      <th class="table-head table__subheader">Avg Score</th>
      <th class="table-head table__subheader">Avg Duration</th>
      <th class="table-head table__subheader">Avg Steps</th>
      <th class="table-head table__subheader">Avg Rewards</th>
    </tr>
  </thead>
  <tbody>
    <tr 
      v-for="record in records" 
      :key="record.generation"
    >
      <td data-label="Generation" class="table__body">{{ record.generation }}</td>
      <td data-label="Score" class="table__body">{{ record.score }} <span :class="scoreDiffClass(record.generation-1)">{{ scoreDiffString(record.generation-1) }}</span></td>
      <td data-label="Duration" class="table__body">{{ Math.floor(record.duration) }} <span :class="durationDiffClass(record.generation-1)">{{ durationDiffString(record.generation-1) }}</span></td>
      <td data-label="Steps" class="table__body">{{ Math.floor(record.steps) }} <span :class="stepDiffClass(record.generation-1)">{{ stepDiffString(record.generation-1) }}</span></td>
      <td data-label="Rewards" class="table__body">{{ record.rewards.toFixed(2) }} <span :class="rewardDiffClass(record.generation-1)">{{ rewardDiffString(record.generation-1) }}</span></td>
    </tr>
  </tbody>
</table>
</template>

<script>
export default {
  name: 'snnake-history-table',

  props: {
    records: { type: Array, required: true }
  },

  data: () => ({
    scoreDiff: [],
    durationDiff: [],
    stepDiff: [],
    rewardDiff: []
  }),

  watch: {
    records() {
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

      if (this.records.length >= 2) {
        const prev = this.records[this.records.length - 2]
        const curr = this.records[this.records.length - 1]

        console.log("prev = ", prev)
        console.log("curr = ", curr)

        this.stepDiff.push(Math.floor(percentageDiff(curr.steps, prev.steps)))
        this.durationDiff.push(Math.floor(percentageDiff(curr.duration, prev.duration)))
        this.rewardDiff.push(Math.floor(percentageDiff(curr.rewards, prev.rewards)))
        this.scoreDiff.push(Math.floor(percentageDiff(curr.score, prev.score)))
      }
    }
  },

  methods: {
    stepDiffString(g) {
      if (g < 0) return

      if (this.stepDiff[g] > 0) {
        return `+${this.stepDiff[g]}%`
      } else if (this.stepDiff[g] === 0) {
        return '0%'
      } else {
        return `-${this.stepDiff[g] * -1}%`
      }
    },

    stepDiffClass(g) {
      if (g < 0) return

      if (this.stepDiff[g] > 0) {
        return ' positive '
      } else if (this.stepDiff[g] === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    },

    durationDiffString(g) {
      if (g < 0) return

      if (this.durationDiff[g] > 0) {
        return `+${this.durationDiff[g]}%`
      } else if (this.durationDiff[g] === 0) {
        return '0%'
      } else {
        return `-${this.durationDiff[g] * -1}%`
      }
    },

    durationDiffClass(g) {
      if (g < 0) return

      if (this.durationDiff[g] > 0) {
        return ' positive '
      } else if (this.durationDiff[g] === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    },

    rewardDiffString(g) {
      if (g < 0) return

      if (this.rewardDiff[g] > 0) {
        return `+${this.rewardDiff[g]}%`
      } else if (this.rewardDiff[g] < 0) {
        return `-${this.rewardDiff[g] * -1}%`
      } else {
        return `0%`
      }
    },

    rewardDiffClass(g) {
      if (g < 0) return

      if (this.rewardDiff[g] > 0) {
        return ' positive '
      } else if (this.rewardDiff[g] === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    },

    scoreDiffString(g) {
      if (g < 0) return

      console.log(`score diff g=${g}, this.scoreDiff[g] = ${this.scoreDiff[g]}, this.scoreDiff = `, this.scoreDiff)

      if (this.scoreDiff[g] > 0) {
        return `+${this.scoreDiff[g]}%`
      } else if (this.scoreDiff[g] < 0) {
        return `-${this.scoreDiff[g] * -1}%`
      } else {
        return `0%`
      }
    },

    scoreDiffClass(g) {
      if (g < 0) return

      if (this.scoreDiff[g] > 0) {
        return ' positive '
      } else if (this.scoreDiff[g] === 0) {
        return ' neutral '
      } else {
        return ' negative '
      }
    }
  }
}
</script>

<style scoped>
.table-head {
  background: #F4F4F4 !important;
  border: none !important;
}

.ui.celled.table {
  box-shadow: none !important;
  border: none;
}

.table__subheader {
  color: #676767 !important;
  font-weight: bold !important;
  font-size: 16px !important;
}

td.table__body {
  border-color: #ffffff !important;
  font-family: monospace;
  font-size: 1em !important;
  font-weight: 400 !important;
  background: #F4F4F4 !important;
  margin-left: 1em !important;
  padding: 4px !important;
  padding-left: 1em !important;
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

td span {
  font-family: monospace;
  font-weight: bold;
}
</style>
