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

  randomHex() {
    const choices = "0123456789ABCDEF";
    let result = "#";
    for (let i = 0; i < 6; i++) {
      result += choices[Math.floor(Math.random() * choices.length)];
    }
    return result;
  }

  generateRandomColours(count) {
    const colours = [];
    for (let i = 0; i < count; i++) {
      colours.push(this.randomHex());
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

  getLuminance(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  getTextColour(backgroundColour) {
    const luminance = this.getLuminance(backgroundColour);
    return luminance > 128 ? "#000000" : "#ffffff";
  }

  updateDisplay() {
    // Clear previous content
    d3.select("#paletteContainer").selectAll("*").remove();

    const fixedWidth = 100;
    const blockHeight = 60;

    // Create SVG with fixed dimensions
    const svg = d3
      .select("#paletteContainer")
      .append("svg")
      .attr("width", "100%")
      .attr("height", this.palette.length * (blockHeight + 2))
      .style("display", "block")
      .style("vertical-align", "top");

    // Create colour blocks
    const blocks = svg
      .selectAll("g")
      .data(this.palette)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * (blockHeight + 2)})`);

    // Add rectangles
    const containerWidth = d3
      .select("#paletteContainer")
      .node()
      .getBoundingClientRect().width;

    blocks
      .append("rect")
      .attr("width", containerWidth)
      .attr("height", blockHeight)
      .attr("fill", (d) => d);

    // Add text labels
    blocks
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", blockHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", (d) => this.getTextColour(d))
      .attr("font-family", "monospace")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d) => d);
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
      .map((colour) => `'${colour}'`)
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
  new PaletteGenerator();
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
