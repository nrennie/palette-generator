let newPalette = null;
let dynamicPalette = null;

function blendPalette(hex1, hex2, alpha = 0.5) {
  if (alpha < 0 || alpha > 1) {
    throw new Error("'alpha' must be between 0 and 1");
  }

  const rgb2 = hexToRgb(hex2); // scalar colour

  const blendOne = (h1) => {
    const rgb1 = hexToRgb(h1);

    const r = Math.round((1 - alpha) * rgb1.r + (alpha) * rgb2.r);
    const g = Math.round((1 - alpha) * rgb1.g + (alpha) * rgb2.g);
    const b = Math.round((1 - alpha) * rgb1.b + (alpha) * rgb2.b);

    return rgbToHex(r, g, b);
  };

  if (Array.isArray(hex1)) {
    return hex1.map(blendOne);
  }

  return blendOne(hex1);
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
  const slider = document.getElementById('alphaSlider');
  const sliderOutput = document.getElementById('alphaValue');
  const blendHex = document.getElementById('blendHex');
  const hexPreview = document.getElementById('hexPreview');
  const hexWarning = document.getElementById('hexWarning');
  const inputHex = document.getElementById('inputHex');
  const inputWarning = document.getElementById('inputWarning');

  let dynamicPalette = ['#A053A1', '#DB778F', '#E69F52', '#09A39A', '#5869C7', '#004B67'];
  function recomputeAll() {
    const hex = blendHex.value.trim();
    const alpha = parseFloat(slider.value);

    if (!dynamicPalette) return;
    if (!isValidHex(hex) || isNaN(alpha)) return;

    const blendedPalette = blendPalette(dynamicPalette, hex, alpha);
    newPalette = blendedPalette;
    palettePlot(dynamicPalette, "#plot");

    const bwPalette = toGreyscale(blendedPalette);
    palettePlot(blendedPalette, "#plotBlend");
    palettePlot(bwPalette, "#plotBW");
    paletteText(blendedPalette);
  }


  slider.addEventListener('input', (e) => {
    const alpha = parseFloat(e.target.value);
    sliderOutput.textContent = alpha;
    recomputeAll();
  });

  blendHex.addEventListener('input', () => {
    const value = blendHex.value.trim();
    renderHexPreview(value, hexPreview, hexWarning);
    recomputeAll();
  });

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

  // RUN ON LOAD
  sliderOutput.textContent = slider.value;
  renderHexPreview(blendHex.value.trim(), hexPreview, hexWarning);
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