import { calcAPCA } from "https://cdn.jsdelivr.net/npm/apca-w3@0.1.9/+esm";

let dynamicPalette = ['#A053A1', '#DB778F', '#E69F52', '#09A39A', '#5869C7', '#004B67'];

function apcaPlot(palette, targetId = "#apca") {
  const n = palette.length;

  // Compute contrast matrix for the given palette
  const contrast_mat = Array(n)
    .fill()
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      contrast_mat[i][j] = calcAPCA(palette[i], palette[j]);
    }
  }

  const svgWidth = 785;
  const axisTitleSpace = 20;
  const gap = 6;
  const swatchSize = 24;
  const fontSize = 14;

  // Clear any existing plot before redrawing
  const container = d3.select(targetId);
  container.selectAll("*").remove();

  const svg = container.append("svg").attr("width", svgWidth);

  // Measure the widest hex label so the margin is exactly as big as it needs to be
  const measure = svg
    .append("text")
    .attr("font-size", fontSize)
    .style("visibility", "hidden");

  let maxLabelWidth = 0;
  palette.forEach((col) => {
    measure.text(col);
    maxLabelWidth = Math.max(maxLabelWidth, measure.node().getBBox().width);
  });
  measure.remove();

  const marginLeft = axisTitleSpace + maxLabelWidth + gap + swatchSize + gap;
  const marginTop = axisTitleSpace + fontSize + gap + swatchSize + gap;

  const size = (svgWidth - marginLeft) / n;
  const svgHeight = marginTop + n * size;

  svg.attr("height", svgHeight);

  // Axis titles, both horizontal, sitting in the top margin strip
  svg
    .append("text")
    .attr("x", marginLeft - gap)
    .attr("y", axisTitleSpace + 70)
    .attr("text-anchor", "end")
    .attr("font-size", fontSize)
    .attr("font-weight", "bold")
    .text("Text Colour");

  svg
    .append("text")
    .attr("x", marginLeft)
    .attr("y", axisTitleSpace / 2)
    .attr("text-anchor", "start")
    .attr("font-size", fontSize)
    .attr("font-weight", "bold")
    .text("Background Colour");

  // Column headers: label above swatch, swatch directly above the grid
  palette.forEach((col, i) => {
    const cx = marginLeft + (i + 0.5) * size;
    const swatchY = marginTop - swatchSize - gap;

    svg
      .append("rect")
      .attr("class", "apca-swatch")
      .attr("x", cx - swatchSize / 2)
      .attr("y", swatchY)
      .attr("width", swatchSize)
      .attr("height", swatchSize)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", col);

    svg
      .append("text")
      .attr("x", cx)
      .attr("y", swatchY - gap)
      .attr("text-anchor", "middle")
      .attr("font-size", fontSize)
      .attr("fill", "black")
      .text(col);
  });

  // Row headers: swatch directly left of the grid, label directly left of the swatch
  palette.forEach((col, i) => {
    const cy = marginTop + (i + 0.5) * size;
    const swatchX = marginLeft - swatchSize - gap;

    svg
      .append("rect")
      .attr("class", "apca-swatch")
      .attr("x", swatchX)
      .attr("y", cy - swatchSize / 2)
      .attr("width", swatchSize)
      .attr("height", swatchSize)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", col);

    svg
      .append("text")
      .attr("x", swatchX - gap)
      .attr("y", cy + fontSize / 3)
      .attr("text-anchor", "end")
      .attr("font-size", fontSize)
      .attr("fill", "black")
      .text(col);
  });

  // Heatmap cells
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      svg
        .append("rect")
        .attr("x", marginLeft + j * size)
        .attr("y", marginTop + i * size)
        .attr("width", size)
        .attr("height", size)
        .attr("fill", "white")
        .attr("stroke", "#ccc");

      svg
        .append("text")
        .attr("x", marginLeft + (j + 0.5) * size)
        .attr("y", marginTop + (i + 0.5) * size)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(contrast_mat[i][j].toFixed(2));
    }
  }

  return svg;
}

document.addEventListener('DOMContentLoaded', () => {
  const inputHex = document.getElementById('inputHex');
  const inputWarning = document.getElementById('inputWarning');

  function recomputeAll() {
    if (!dynamicPalette) return;

    palettePlot(dynamicPalette, "#plot");
    paletteText(dynamicPalette);
    apcaPlot(dynamicPalette, "#apca");
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