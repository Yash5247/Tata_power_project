document.addEventListener('DOMContentLoaded', () => {
  const chartElement = document.getElementById('chart');
  if (!chartElement || typeof Plotly === 'undefined') return;

  const data = [{
    x: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    y: [10, 15, 13, 17, 12],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Example'
  }];

  const layout = {
    title: 'Sample Trend',
    margin: { t: 40, r: 20, b: 40, l: 40 }
  };

  Plotly.newPlot(chartElement, data, layout, {responsive: true});
});


