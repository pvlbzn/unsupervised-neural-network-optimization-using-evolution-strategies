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
      <td data-label="Score" class="table__body">{{ record.score }}</td>
      <td data-label="Duration" class="table__body">{{ Math.floor(record.duration) }}</td>
      <td data-label="Steps" class="table__body">{{ Math.floor(record.steps) }}</td>
      <td data-label="Rewards" class="table__body">{{ record.rewards.toFixed(2) }}</td>
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
</style>
