function rgbToGreyscale(hex) {
  const rgb = d3.color(hex).rgb()
  const red = rgb['r'] * 0.30
  const green = rgb['g'] * 0.59
  const blue = rgb['b'] * 0.11
  const grey = [red + green + blue, red + green + blue, red + green + blue]
  const greyHex = d3.rgb(...grey).formatHex();
  return greyHex
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const num = parseInt(hex, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidHex(hex) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function toGreyscale(hexArray) {
  return hexArray.map(rgbToGreyscale)
}

function paletteReport(palette) {

  const url = 'https://projects.susielu.com/viz-palette?colors=' + encodeURIComponent(JSON.stringify(palette));
  window.open(url, '_blank');
}

function randomHex() {
  const choices = "0123456789ABCDEF";
  let result = "#";
  for (let i = 0; i < 6; i++) {
    result += choices[Math.floor(Math.random() * choices.length)];
  }
  return result;
}

function generateRandomColours(count) {
  const colours = [];
  for (let i = 0; i < count; i++) {
    colours.push(this.randomHex());
  }
  return colours;
}




// Plot palette as heatmap
function palettePlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const n = colPalette.length;
  const boxSize = 70 // width / n;
  const height = boxSize + padding * 2;

  const labels = d3.range(n).map(i => String.fromCharCode(65 + i));

  const data = d3.range(n).map(i => ({
    x: labels[i],
    y: 1,
    colour: colPalette[i]
  }));

  d3.select(plotID).html(''); // Clear previous chart

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

  const x = d3.scaleBand()
    .range([0, width])
    .domain(labels)
    .padding(0.05);

  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.x))
    .attr('y', padding)
    .attr('width', x.bandwidth())
    .attr('height', boxSize)
    .style('fill', d => d.colour)
    .style('stroke', '#151C28');

}



// Plot palette as area chart
function areaPlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.5;
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

// Plot palette as line chart
function linePlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.4;
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



// Plot palette as line chart
function scatterPlot(colPalette, plotID) {

  const width = 800;
  const padding = 10;
  const aspectRatio = 0.5;
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
  const aspectRatio = 0.4;
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


// Add text
function paletteText(palette) {

  // Clear existing content
  d3.select("#rCode").selectAll("*").remove();
  d3.select("#pythonCode").selectAll("*").remove();

  // R code
  const rCode = `c(${palette
    .map((colour) => `"${colour}"`)
    .join(", ")})`;
  d3.select("#rCode").text(rCode);

  // Python code
  const pythonCode = `[${palette
    .map((colour) => `'${colour}'`)
    .join(", ")}]`;
  d3.select("#pythonCode").text(pythonCode);

}




function parseHexArrayStrict(input) {
  const trimmed = input.trim();

  // must be either JS array or R vector
  const isJSArray = trimmed.startsWith('[') && trimmed.endsWith(']');
  const isRVector = /^c\s*\(/i.test(trimmed) && trimmed.endsWith(')');

  if (!isJSArray && !isRVector) {
    return { valid: false, value: null };
  }

  // extract inside brackets
  let inner = trimmed;

  if (isRVector) {
    inner = trimmed.replace(/^c\s*\(/i, '(').slice(1, -1); // inside (...)
  } else {
    inner = trimmed.slice(1, -1); // inside [...]
  }

  // split by commas NOT inside quotes
  const parts = inner.split(',').map(s => s.trim());

  if (parts.length === 0) {
    return { valid: false, value: null };
  }

  const values = [];

  for (const part of parts) {
    // must be properly quoted
    const match = part.match(/^['"](#?[0-9a-fA-F]{6})['"]$/);

    if (!match) {
      return { valid: false, value: null }; // 🚨 strict fail
    }

    const hex = match[1].toUpperCase();

    if (!/^#[0-9A-F]{6}$/.test(hex)) {
      return { valid: false, value: null };
    }

    values.push(hex);
  }

  return { valid: true, value: values };
}


function clampHex(el) {
  el.value = el.value.slice(0, 7);
}
