(function applyTheme() {
  const primary = localStorage.getItem("styleo_primary");   // forest green
  const secondary = localStorage.getItem("styleo_secondary"); // GOLD !!!!!!!!!!!!!!! 
  // ЦВЕТА СВЕРХУ - ЭТО ЦВЕТА ВАЖНЫЕ
  // КОТОРЫЕ ДЛЯ ТЕХНИЧЕСКОГО ЗАДАНИЯ!!!!!!!!!!!!!!!!!!!
  // КОТОРЫЕ ДЛЯ ТЕХНИЧЕСКОГО ЗАДАНИЯ!!!!!!!!!!!!!!!!!!!
  // КОТОРЫЕ ДЛЯ ТЕХНИЧЕСКОГО ЗАДАНИЯ!!!!!!!!!!!!!!!!!!!
  
  const root = document.documentElement;

  if (primary) {
    root.style.setProperty("--bg-color", primary);

    // derive surfaces hehehe
    root.style.setProperty(
      "--surface-color",
      mix(primary, "#000000", 0.18)
    );
    root.style.setProperty(
      "--surface-2",
      mix(primary, "#000000", 0.28)
    );
  }

  if (secondary) {
    root.style.setProperty("--accent-color", secondary);

    // auto contrast 
    root.style.setProperty(
      "--accent-contrast",
      getContrastColor(secondary)
    );
  }

  /* helpers lol  */
  function mix(c1, c2, weight) {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    return rgbToHex(
      Math.round(a.r * (1 - weight) + b.r * weight),
      Math.round(a.g * (1 - weight) + b.g * weight),
      Math.round(a.b * (1 - weight) + b.b * weight)
    );
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(v => v.toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function getContrastColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#071b14" : "#ffffff";
  }
})();
