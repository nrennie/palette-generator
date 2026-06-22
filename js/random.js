let paletteGenerator;

class PaletteGenerator {
  constructor() {
    this.palette = [];
    this.keptColours = new Set();
    this.colourCount = 6;
    this.maxColours = 12;

    this.initializeElements();
    this.createDropdown();
    this.bindEvents();
    this.generatePalette();
  }

  initializeElements() {
    this.colourCountSelect = document.getElementById("colourCount");
    this.generateBtn = document.getElementById("generateBtn");
    this.paletteContainer = document.getElementById("paletteContainer");
    this.keepColoursContainer = document.getElementById("keepColoursContainer");
    this.rCodeContainer = document.getElementById("rCode");
    this.pythonCodeContainer = document.getElementById("pythonCode");
  }

  createDropdown() {
    const select = d3.select("#colourCount");

    // Clear existing options
    select.selectAll("option").remove();

    // Create options based on maxColours parameter
    const options = select
      .selectAll("option")
      .data(d3.range(1, this.maxColours + 1))
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d)
      .property("selected", (d) => d === this.colourCount);
  }

  bindEvents() {
    this.colourCountSelect.addEventListener("change", () => {
      this.colourCount = parseInt(this.colourCountSelect.value);
      this.generatePalette();
    });

    this.generateBtn.addEventListener("click", () => {
      this.generatePalette();
    });
  }

  generateRandomColours(count) {
    const colours = [];
    for (let i = 0; i < count; i++) {
      colours.push(randomHex());
    }
    return colours;
  }

  generatePalette() {
    const keptColoursArray = Array.from(this.keptColours);
    const numNewColours = Math.max(
      0,
      this.colourCount - keptColoursArray.length
    );

    if (keptColoursArray.length > this.colourCount) {
      // If we have more kept colours than requested, trim to the first N
      this.palette = keptColoursArray.slice(0, this.colourCount);
    } else {
      // Generate new colours and combine with kept ones
      const newColours = this.generateRandomColours(numNewColours);
      this.palette = [...keptColoursArray, ...newColours];
    }

    this.updateDisplay();
    this.updateKeepColoursCheckboxes();
    this.updateCodeBlocks();
  }

  updateDisplay() {
    palettePlot(this.palette, "#paletteContainer");
    const bwPalette = toGreyscale(this.palette);
    palettePlot(bwPalette, "#plotBW");
  }

  updateKeepColoursCheckboxes() {
    this.keepColoursContainer.innerHTML = "";

    this.palette.forEach((colour, index) => {
      const container = document.createElement("div");
      container.className = "checkbox-container";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `keep-${index}`;
      checkbox.checked = this.keptColours.has(colour);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          this.keptColours.add(colour);
        } else {
          this.keptColours.delete(colour);
        }
      });

      const colourPreview = document.createElement("div");
      colourPreview.className = "colour-preview";
      colourPreview.style.backgroundColor = colour;

      const label = document.createElement("label");
      label.htmlFor = `keep-${index}`;
      label.textContent = colour;
      label.style.margin = "0";
      label.style.cursor = "pointer";

      container.appendChild(checkbox);
      container.appendChild(colourPreview);
      container.appendChild(label);

      this.keepColoursContainer.appendChild(container);
    });
  }

  updateCodeBlocks() {
    // Clear existing content
    d3.select("#rCode").selectAll("*").remove();
    d3.select("#pythonCode").selectAll("*").remove();

    // R code
    const rCode = `c(${this.palette
      .map((colour) => `"${colour}"`)
      .join(", ")})`;
    d3.select("#rCode").text(rCode);

    // Python code
    const pythonCode = `[${this.palette
      .map((colour) => `'${colour}'`)
      .join(", ")}]`;
    d3.select("#pythonCode").text(pythonCode);
  }
}

// Initialize the palette generator when the page loads
document.addEventListener("DOMContentLoaded", () => {
  paletteGenerator = new PaletteGenerator();

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

  document.getElementById("paletteBtn").addEventListener("click", () => {
    paletteReport(paletteGenerator.palette);
  });
});