let dynamicPalette = ['#A053A1', '#DB778F', '#E69F52', '#09A39A', '#5869C7', '#004B67'];

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