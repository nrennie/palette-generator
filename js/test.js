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

  const size = 80;
  const marginLeft = 80;
  const marginTop = 40;
  const marginBottom = 20;
  const svgWidth = size * (n + 1) + marginLeft;
  const svgHeight = size * (n + 1) + marginTop + marginBottom;

  // Clear any existing plot before redrawing
  const container = d3.select(targetId);
  container.selectAll("*").remove();

  const svg = container
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // X-axis label on top, centered
  svg
    .append("text")
    .attr("x", marginLeft + ((n + 1) * size) / 2)
    .attr("y", marginTop / 2)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Background Colour");

  // Column headers
  palette.forEach((col, i) => {
    svg
      .append("rect")
      .attr("x", marginLeft + (i + 1) * size)
      .attr("y", marginTop)
      .attr("width", size)
      .attr("height", size)
      .attr("fill", col)
      .attr("stroke", "#ccc");

    svg
      .append("text")
      .attr("x", marginLeft + (i + 1.5) * size)
      .attr("y", marginTop + size / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text(col);
  });

  // Row headers
  palette.forEach((col, i) => {
    svg
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop + (i + 1) * size)
      .attr("width", size)
      .attr("height", size)
      .attr("fill", col)
      .attr("stroke", "#ccc");

    svg
      .append("text")
      .attr("x", marginLeft + size / 2)
      .attr("y", marginTop + (i + 1.5) * size)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text(col);
  });

  // Heatmap cells
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      svg
        .append("rect")
        .attr("x", marginLeft + (j + 1) * size)
        .attr("y", marginTop + (i + 1) * size)
        .attr("width", size)
        .attr("height", size)
        .attr("fill", "white")
        .attr("stroke", "#ccc");

      svg
        .append("text")
        .attr("x", marginLeft + (j + 1.5) * size)
        .attr("y", marginTop + (i + 1.5) * size)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(contrast_mat[i][j].toFixed(2));
    }
  }

  // Y-axis label
  svg
    .append("text")
    .attr("x", marginLeft / 2)
    .attr("y", marginTop + ((n + 1) * size) / 2)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr(
      "transform",
      `rotate(-90, ${marginLeft / 2}, ${marginTop + ((n + 1) * size) / 2})`
    )
    .text("Text Colour");

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