<template>
  <div id="canvas-panel"></div>
</template>

<script>
import { NeturalNetworkController } from '../../../snake/controllers/NeuralNetworkController';
import Store from '../../../utils/Store'


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

    this.controller.run()
  },

  watch: {
    focus(after, before) {
      console.log(after, before)
      Store.reactor.dispatch('controllerSelectAgent', { newId: after, oldId: before })
    }
  }
}
</script>

<style>

</style>
