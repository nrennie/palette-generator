let dynamicPalette = ['#A053A1', '#DB778F', '#E69F52', '#09A39A', '#5869C7', '#004B67'];


// Plot palette as line chart
function linePlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.8;
  const height = width * aspectRatio + padding * 2;
  const nPoints = 50;

  const xValues = d3.range(nPoints);

  const lineData = colPalette.map(function (colour) {
    let y = 0;
    const values = xValues.map(function (i) {
      y += d3.randomNormal(0, 1)();
      return { x: i, y: y };
    });
    return { colour: colour, values: values };
  });

  d3.select(plotID).html('');

  const chartContainer = d3.select(plotID)
    .style('background-color', "#F0F5F5")
    .style('padding', padding + 'px')
    .style('width', width + padding * 2 + 'px');

  const svg = chartContainer
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g');

  const x = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(xValues));

  const yExtent = d3.extent(lineData.flatMap(function (d) {
    return d.values.map(function (v) { return v.y; });
  }));

  const y = d3.scaleLinear()
    .range([height - padding * 2, 0])
    .domain(yExtent)
    .nice();

  const lineGenerator = d3.line()
    .x(function (d) { return x(d.x); })
    .y(function (d) { return y(d.y); });

  svg.selectAll('path')
    .data(lineData)
    .enter()
    .append('path')
    .attr('d', function (d) { return lineGenerator(d.values); })
    .style('fill', 'none')
    .style('stroke', function (d) { return d.colour; })
    .style('stroke-width', 2);

}



// Plot palette as area chart
function areaPlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.8;
  const height = width * aspectRatio + padding * 2;
  const nPoints = 12;
  const n = colPalette.length;

  const keys = d3.range(n).map(function (i) { return 'layer' + i; });

  const colourByKey = {};
  keys.forEach(function (key, i) { colourByKey[key] = colPalette[i]; });

  const data = d3.range(nPoints).map(function (i) {
    const row = { x: i };
    keys.forEach(function (key) {
      row[key] = Math.random() * 10 + 1;
    });
    return row;
  });

  const stackKeys = keys.slice().reverse();

  const stack = d3.stack().keys(stackKeys);
  const series = stack(data);

  d3.select(plotID).html('');

  const chartContainer = d3.select(plotID)
    .style('background-color', "#F0F5F5")
    .style('padding', padding + 'px')
    .style('width', width + padding * 2 + 'px');

  const svg = chartContainer
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g');

  const x = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(data, function (d) { return d.x; }));

  const yMax = d3.max(series, function (layer) {
    return d3.max(layer, function (d) { return d[1]; });
  });

  const y = d3.scaleLinear()
    .range([height - padding * 2, 0])
    .domain([0, yMax])
    .nice();

  const areaGenerator = d3.area()
    .x(function (d) { return x(d.data.x); })
    .y0(function (d) { return y(d[0]); })
    .y1(function (d) { return y(d[1]); });

  svg.selectAll('path')
    .data(series)
    .enter()
    .append('path')
    .attr('d', areaGenerator)
    .style('fill', function (d) { return colourByKey[d.key]; })
    .style('stroke', '#151C28');

}


// Plot palette as scatter chart
function scatterPlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.8;
  const height = width * aspectRatio + padding * 2;
  const nPoints = 20;
  const radius = 5;

  const data = colPalette.flatMap(function(colour) {
    return d3.range(nPoints).map(function() {
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        colour: colour
      };
    });
  });

  d3.select(plotID).html('');

  const chartContainer = d3.select(plotID)
    .style('background-color', "#F0F5F5")
    .style('padding', padding + 'px')
    .style('width', width + padding * 2 + 'px');

  const svg = chartContainer
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g');

  const x = d3.scaleLinear()
    .range([radius, width - radius])
    .domain([0, 100]);

  const y = d3.scaleLinear()
    .range([height - padding * 2 - radius, radius])
    .domain([0, 100]);

  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d) { return x(d.x); })
    .attr('cy', function(d) { return y(d.y); })
    .attr('r', radius)
    .style('fill', function(d) { return d.colour; })
    .style('stroke', '#151C28');

}


// Plot palette as stacked bar chart
function barPlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.8;
  const height = width * aspectRatio + padding * 2;
  const nBars = 5;
  const n = colPalette.length;

  const keys = d3.range(n).map(function(i) { return 'segment' + i; });

  const colourByKey = {};
  keys.forEach(function(key, i) { colourByKey[key] = colPalette[i]; });

  const categories = d3.range(nBars).map(function(i) { return 'bar' + i; });

  const data = categories.map(function(category) {
    const row = { category: category };
    keys.forEach(function(key) {
      row[key] = Math.random() * 10 + 1;
    });
    return row;
  });

  const stack = d3.stack().keys(keys);
  const series = stack(data);

  d3.select(plotID).html('');

  const chartContainer = d3.select(plotID)
    .style('background-color', "#F0F5F5")
    .style('padding', padding + 'px')
    .style('width', width + padding * 2 + 'px');

  const svg = chartContainer
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g');

  const totalMax = d3.max(data, function(d) {
    return keys.reduce(function(sum, key) { return sum + d[key]; }, 0);
  });

  const x = d3.scaleLinear()
    .range([0, width])
    .domain([0, totalMax]);

  const y = d3.scaleBand()
    .range([0, height - padding * 2])
    .domain(categories)
    .padding(0.2);

  svg.selectAll('g.layer')
    .data(series)
    .enter()
    .append('g')
    .attr('class', 'layer')
    .style('fill', function(d) { return colourByKey[d.key]; })
    .selectAll('rect')
    .data(function(d) { return d; })
    .enter()
    .append('rect')
    .attr('x', function(d) { return x(d[0]); })
    .attr('y', function(d) { return y(d.data.category) + padding; })
    .attr('width', function(d) { return x(d[1]) - x(d[0]); })
    .attr('height', y.bandwidth())
    .style('stroke', '#151C28');

}



document.addEventListener('DOMContentLoaded', () => {
  const inputHex = document.getElementById('inputHex');
  const inputWarning = document.getElementById('inputWarning');

  function recomputeAll() {
    if (!dynamicPalette) return;

    paletteText(dynamicPalette);
    linePlot(dynamicPalette, "#line");
    areaPlot(dynamicPalette, "#area");
    scatterPlot(dynamicPalette, "#scatter");
    barPlot(dynamicPalette, "#bar");
  }

  // Draw the plots immediately on load with the default palette
  recomputeAll();

  inputHex.addEventListener('input', () => {
    const result = parseHexArrayStrict(inputHex.value);

    if (!result.valid) {
      dynamicPalette = null;

      inputWarning.textContent =
        "Invalid palette. All values must be valid hex codes like ['#FFF430', '#FFFFFF'] or c('#FFF430', '#FFFFFF').";
      inputWarning.classList.add('warning');

      return;
    }

    dynamicPalette = result.value;

    inputWarning.textContent = '';
    inputWarning.classList.remove('warning');

    recomputeAll();
  });

  // Palette button
  document.getElementById("paletteBtn").addEventListener("click", function () {
    paletteReport(dynamicPalette);
  });

  // Copy button
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const wrapper = button.closest(".code-wrapper");
      if (!wrapper) return;
      const codeDiv = wrapper.querySelector(".code-block");
      if (!codeDiv) return;

      navigator.clipboard
        .writeText(codeDiv.innerText)
        .then(() => {
          button.textContent = "✓";
          setTimeout(() => {
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10 1H2a1 1 0 0 0-1 1v10h1V2h8V1z"/>
          <path d="M14 3H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM6 4h8v10H6V4z"/>
        </svg>`;
          }, 1500);
        })
        .catch((err) => console.error("Failed to copy:", err));
    });
  });
});