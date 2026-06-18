const paletteFiles = {
  ColorBrewer,
  PrettyCols,
  Pride,
  PaulTol,
  CARTOColors
};

let currentFileName = null;
let currentPaletteName = null;

// Add options to dropdowns and set up event listeners
function populateDropdowns() {
  const fileNames = Object.keys(paletteFiles);

  // File selector
  const fileDropdown = d3.select('#file-dropdown-container')
    .append('select')
    .attr('id', 'file-dropdown')
    .on('change', function () {
      const selectedFile = d3.select(this).property('value');
      updatePaletteDropdown(selectedFile);
    });

  fileDropdown.selectAll('option')
    .data(fileNames)
    .enter()
    .append('option')
    .text(d => d)
    .attr('value', d => d);

  // Initial palette load
  updatePaletteDropdown(fileNames[0]);
}

function updatePaletteDropdown(fileName) {
  currentFileName = fileName;

  const paletteNames = Object.keys(paletteFiles[fileName]);

  d3.select('#palette-dropdown').remove();

  const paletteDropdown = d3.select('#palette-dropdown-container')
    .append('select')
    .attr('id', 'palette-dropdown')
    .on('change', function () {
      const selectedPalette = d3.select(this).property('value');

      currentPaletteName = selectedPalette;

      const colPalette = paletteFiles[fileName][selectedPalette].colors;
      const greyPalette = toGreyscale(colPalette);

      palettePlot(colPalette, "#plot");
      palettePlot(greyPalette, "#plotBW");
      paletteText(colPalette);
    });

  paletteDropdown.selectAll('option')
    .data(paletteNames)
    .enter()
    .append('option')
    .text(d => d)
    .attr('value', d => d);

  paletteDropdown.dispatch('change');
}

window.onload = function () {
  populateDropdowns();
};

document.addEventListener("DOMContentLoaded", () => {
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

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("paletteBtn").addEventListener("click", function () {
    paletteReport(paletteFiles[currentFileName][currentPaletteName].colors);
  });
});


