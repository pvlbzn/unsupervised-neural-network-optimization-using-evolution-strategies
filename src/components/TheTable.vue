<template>
<table v-if="agents.length !== 0" class="ui celled table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Score</th>
      <th>Alive</th>
    </tr>
  </thead>
  <tbody>
    <tr 
      v-for="agent in agents" 
      :key="agent.id"
      @mouseover="$emit('focus', agent.id)"
    >
      <td data-label="ID">{{ agent.id }}</td>
      <td data-label="Score">{{ agent.score }}</td>
      <td data-label="Alive">{{ agent.alive }}</td>
    </tr>
  </tbody>
</table>
</template>

<script>
export default {
  name: 'snnake-table',

  props: {
    agents: { type: Array, required: true }
  },

}
</script>

<style>

</style>
