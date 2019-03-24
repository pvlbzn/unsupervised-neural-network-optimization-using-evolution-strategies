<template>
<table v-if="records.length !== 0" class="ui celled table">
  <thead>
    <tr>
      <th>Generation</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody>
    <tr 
      v-for="record in records" 
      :key="record.generation"
    >
      <td data-label="Generation">{{ record.generation }}</td>
      <td data-label="Score">{{ record.score }}</td>
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

<style>

</style>
