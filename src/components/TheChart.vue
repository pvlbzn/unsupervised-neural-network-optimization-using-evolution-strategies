<template>
  <div id="plot"></div>
</template>

<script>
export default {
  props: {
    nagents: { type: Number, required: true },
    history: { type: Array, required: true },
  },

  data: () => ({
    // There are as many traces as agents + 1
    traces: [],
    plt: null
  }),

  created: function() {
    const newLineTrace = () => ({ x: [], y: [], mode: 'lines', type: 'line', line: { color: 'rgba(29, 29, 29, 0.8)' } })
    const newScatterTrace = () => ({ x: [], y: [], mode: 'markers', type: 'scatter', marker: { size: 4, color: 'rgba(29, 29, 29, 0.2)' } })
    
    const tmp = [newLineTrace()]

    for (let i = 0; i < this.nagents; i++) {
      tmp.push(newScatterTrace())
    }

    this.traces = tmp
  },

  watch: {
    history(o, n) {
      // Each history update lastest element should be pushed
      // to the chart and chart has to be updated
      if (!this.history) return

      this.updateData(this.history[this.history.length - 1])
      Plotly.redraw('plot', this.traces)
    }
  },

  mounted: function() {
    const layout = { showlegend: false }

    Plotly.newPlot('plot', this.traces,layout, { responsive: true, showlegend: false })
  },

  methods: {
    updateData(entry) {
      console.log('entry=', entry)
      console.log('traces=', this.traces)
      // Create one line point out of average store,
      // thats 0 trace, and nagents traces for each data point
      const avg = Math.floor(entry.scores.reduce((x, y) => x + y)) / entry.scores.length
      console.log('avg = ', avg)
      this.traces[0].x.push(entry.generation)
      this.traces[0].y.push(avg)

      for (let i = 1; i < entry.scores.length + 1; i++) {
        this.traces[i].x.push(entry.generation)
        this.traces[i].y.push(Math.floor(entry.scores[i]))
      }
    }, 
  }
}
</script>

<style>

</style>
