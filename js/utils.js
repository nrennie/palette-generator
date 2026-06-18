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