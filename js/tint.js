let newPalette = null;
let dynamicPalette = null;

function tintPalette(hex, steps = 5, mode = "both") {
  const validModes = ["lighter", "darker", "both"];
  if (!validModes.includes(mode)) {
    throw new Error(`mode must be one of: ${validModes.join(", ")}`);
  }

  const rgb = hexToRgb(hex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const blendWith = (target, alpha) => {
    const r = Math.round((1 - alpha) * rgb.r + alpha * target.r);
    const g = Math.round((1 - alpha) * rgb.g + alpha * target.g);
    const b = Math.round((1 - alpha) * rgb.b + alpha * target.b);
    return rgbToHex(r, g, b);
  };

  const lighterRamp = (n) => {
    const out = [];
    for (let i = n; i >= 1; i--) {
      out.push(blendWith(white, i / (n + 1)));
    }
    return out;
  };

  const darkerRamp = (n) => {
    const out = [];
    for (let i = 1; i <= n; i++) {
      out.push(blendWith(black, i / (n + 1)));
    }
    return out;
  };

  if (mode === "lighter") {
    return lighterRamp(steps).reverse();
  }
  if (mode === "darker") {
    return darkerRamp(steps);
  }
  const hasCenter = steps % 2 === 1;
  const sideCount = hasCenter ? (steps - 1) / 2 : steps / 2;

  const lighter = lighterRamp(sideCount);
  const darker = darkerRamp(sideCount);

  return hasCenter ? [...lighter, hex, ...darker] : [...lighter, ...darker];
}

function clampHex(el) {
  el.value = el.value.slice(0, 7);
}

function renderHexPreview(value, hexPreview, hexWarning) {
  if (isValidHex(value)) {
    hexWarning.textContent = '';
    hexWarning.classList.remove('warning');

    hexPreview.style.backgroundColor = value;
    hexPreview.style.display = 'inline-block';
  } else {
    hexPreview.style.display = 'none';

    hexWarning.textContent = 'Invalid hex code. Use format #RRGGBB (0-9, A-F).';
    hexWarning.classList.add('warning');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('stepsSlider');
  const sliderOutput = document.getElementById('stepsValue');
  const tintHex = document.getElementById('tintHex');
  const hexPreview = document.getElementById('hexPreview');
  const hexWarning = document.getElementById('hexWarning');

  function getDirValue() {
    return document.querySelector('input[name="dir"]:checked').value;
  }

  function recomputeAll() {
    const hex = tintHex.value.trim();
    const steps = parseInt(slider.value);
    const dirVal = getDirValue();

    if (!isValidHex(hex)) return;

    const tintedPalette = tintPalette(hex, steps, dirVal);
    newPalette = tintedPalette;
    palettePlot(tintedPalette, "#plotTint");
    paletteText(tintedPalette);
  }

  slider.addEventListener('input', (e) => {
    const steps = parseInt(e.target.value);
    sliderOutput.textContent = steps;
    recomputeAll();
  });

  tintHex.addEventListener('input', () => {
    const value = tintHex.value.trim();
    renderHexPreview(value, hexPreview, hexWarning);
    recomputeAll();
  });

  const dirInputs = document.querySelectorAll('input[name="dir"]');
  dirInputs.forEach((radio) => {
    radio.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      recomputeAll();
    });
  });




  // RUN ON LOAD
  renderHexPreview(tintHex.value.trim(), hexPreview, hexWarning);
  recomputeAll();

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

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("paletteBtn").addEventListener("click", function () {
    paletteReport(newPalette);
  });
});