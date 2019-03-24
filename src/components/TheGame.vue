<template>
  <div id="canvas-panel"></div>
</template>

<script>
import { NeturalNetworkController } from '../controller/NeuralNetworkController.ts'
import Store from '../utils/Store.ts'


export default {
  name: 'snnake-game',

  props: {
    params: { type: Object, required: true },
    focus: { type: Number, required: true },
  },

  data: () => ({
    controller: null
  }),

  mounted: function() {
    this.controller = new NeturalNetworkController(this.params)
    this.controller.construct()

    Store.reactor.add('controllerAgentUpdate', agentState => this.$emit('update', agentState))
    Store.reactor.add('controllerGenerationDone', agents => this.$emit('done', agents))
    Store.reactor.add('controllerHistoryUpdate', history => this.$emit('generation', history))

    this.controller.run()
  },

  watch: {
    focus(after, before) {
      Store.reactor.dispatch('controllerSelectAgent', { newId: after, oldId: before })
    }
  }
}
</script>

<style>

</style>
