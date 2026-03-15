(function () {
  const CONFIG = {
    width: 820,
    height: 820,
    symbolSize: 220,
    dotRadius: 3,
    dotOpacity: 0.75,
    gridGap: 60,
    topPadding: 140,
    bottomPadding: 60,
    animationDuration: 1500,
    animationStagger: 3,
  };

  const ELEMENTS = [
    {
      name: "Water", key: "water", color: "#5DADE2", row: 0, col: 0,
      path: "M110,8 C65,55 8,108 8,138 C8,185 52,212 110,212 C168,212 212,185 212,138 C212,108 155,55 110,8Z",
    },
    {
      name: "Air", key: "air", color: "#A99BBD", row: 0, col: 1,
      path: "M22,190 C16,188 10,180 12,168 C8,150 24,134 42,134 C40,110 52,84 76,76 C84,54 106,44 128,48 C146,42 168,56 174,76 C186,68 206,74 212,94 C226,104 230,126 218,142 C232,152 234,170 222,182 C220,188 216,190 212,191 L22,191Z",
    },
    {
      name: "Earth", key: "earth", color: "#58B368", row: 1, col: 0,
      path: "M110,8 L200,58 L200,162 L110,212 L20,162 L20,58Z",
    },
    {
      name: "Fire", key: "fire", color: "#E57373", row: 1, col: 1,
      path: "M110,212 C70,185 18,145 36,88 C46,110 68,115 80,82 C86,100 98,72 110,12 C122,72 134,100 140,82 C152,115 174,110 184,88 C202,145 150,185 110,212Z",
    },
  ];

  // Module-level state for re-rendering
  let allData = null;
  let dotsGroups = {};
  let countLabels = {};
  let hiddenPaths = {};
  let hiddenGroup = null;
  let titleLabel = null;

  // Re-renders dots for all four elements given a counts object {water, earth, fire, air}
  function renderDots(counts) {
    ELEMENTS.forEach(function (element) {
      const count = counts[element.key] || 0;

      countLabels[element.key].text(count + " mentions");
      dotsGroups[element.key].selectAll("circle").remove();

      if (count === 0) return;

      const dots = generateDotsInPath(hiddenPaths[element.key], count);

      dotsGroups[element.key]
        .selectAll("circle")
        .data(dots)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; })
        .attr("r", 0)
        .attr("fill", element.color)
        .attr("opacity", CONFIG.dotOpacity)
        .transition()
        .duration(CONFIG.animationDuration)
        .delay(function (d, i) { return i * CONFIG.animationStagger; })
        .attr("r", CONFIG.dotRadius);
    });
  }

  // Public API: called by other visualizations to filter by character and/or element
  // character: string name (e.g. "Katara") or null for all characters
  // element: "water" | "earth" | "fire" | "air" or null for all elements
  window.filterElementViz = function (character, element) {
    if (!allData) return;

    let counts;
    if (character && allData.by_character[character]) {
      counts = Object.assign({}, allData.by_character[character]);
    } else {
      counts = Object.assign({}, allData.totals);
    }

    if (element) {
      counts = { water: 0, earth: 0, fire: 0, air: 0 };
      const source = character && allData.by_character[character]
        ? allData.by_character[character]
        : allData.totals;
      counts[element] = source[element] || 0;
    }

    const subtitle = character
      ? (element ? character + " · " + element[0].toUpperCase() + element.slice(1) + " only"
                 : character + "'s bending mentions")
      : "How often each element's bending is referenced across all 61 episodes";
    titleLabel.text(subtitle);

    renderDots(counts);
  };

  function buildControls(data) {
    const frame = document.getElementById("frame2");
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "text-align:center; margin-bottom:12px;";

    const label = document.createElement("label");
    label.textContent = "Filter by character: ";
    label.style.cssText = "font-family:'Philosopher',serif; font-size:14px; color:var(--ink); margin-right:6px;";

    const select = document.createElement("select");
    select.style.cssText = [
      "font-family:'Philosopher',serif",
      "font-size:14px",
      "padding:4px 10px",
      "border:1px solid var(--ink-ghost)",
      "border-radius:4px",
      "background:var(--parchment-lt)",
      "color:var(--ink)",
      "cursor:pointer",
    ].join(";");

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Characters";
    select.appendChild(allOption);

    Object.keys(data.by_character)
      .sort()
      .forEach(function (char) {
        const opt = document.createElement("option");
        opt.value = char;
        opt.textContent = char;
        select.appendChild(opt);
      });

    select.addEventListener("change", function () {
      window.filterElementViz(this.value || null, null);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    frame.insertBefore(wrapper, frame.firstChild);
  }

  d3.json("data/processed/element_bending.json").then(function (data) {
    allData = data;

    const svg = d3
      .select("#frame2")
      .append("svg")
      .attr("width", CONFIG.width)
      .attr("height", CONFIG.height)
      .attr("viewBox", `0 0 ${CONFIG.width} ${CONFIG.height}`)
      .style("display", "block")
      .style("margin", "0 auto");

    // Title
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Uncial Antiqua', cursive")
      .attr("font-size", "28px")
      .attr("fill", "var(--ink)")
      .text("Meet the Elements");

    // Subtitle (stored so filterElementViz can update it)
    titleLabel = svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Philosopher', serif")
      .attr("font-size", "13px")
      .attr("fill", "var(--ink-faded)")
      .text("How often each element's bending is referenced across all 61 episodes");

    // Instruction line
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", 105)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Philosopher', serif")
      .attr("font-size", "11px")
      .attr("fill", "var(--ink-ghost)")
      .attr("font-style", "italic")
      .text("Each dot = one bending reference in the transcript");

    // Grid layout
    const gridWidth = CONFIG.symbolSize * 2 + CONFIG.gridGap;
    const gridStartX = (CONFIG.width - gridWidth) / 2;
    const gridStartY = CONFIG.topPadding;

    // Hidden paths for point-in-shape testing (used both on init and during re-render)
    hiddenGroup = svg.append("g").attr("opacity", 0);

    ELEMENTS.forEach(function (element) {
      const offsetX = gridStartX + element.col * (CONFIG.symbolSize + CONFIG.gridGap);
      const offsetY = gridStartY + element.row * (CONFIG.symbolSize + CONFIG.gridGap + 40);

      const group = svg.append("g")
        .attr("transform", `translate(${offsetX}, ${offsetY})`);

      // Hidden path stored for re-use during filter re-renders
      hiddenPaths[element.key] = hiddenGroup.append("path")
        .attr("d", element.path)
        .attr("fill", "black")
        .node();

      // Faint outline
      group.append("path")
        .attr("d", element.path)
        .attr("fill", "none")
        .attr("stroke", element.color)
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.25);

      // Dots group (cleared and re-populated on filter)
      dotsGroups[element.key] = group.append("g");

      // Element name
      group.append("text")
        .attr("x", CONFIG.symbolSize / 2 + 10)
        .attr("y", CONFIG.symbolSize + 28)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Uncial Antiqua', cursive")
        .attr("font-size", "15px")
        .attr("fill", element.color)
        .text(element.name);

      // Mention count label (stored so renderDots can update it)
      countLabels[element.key] = group.append("text")
        .attr("x", CONFIG.symbolSize / 2 + 10)
        .attr("y", CONFIG.symbolSize + 46)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Philosopher', serif")
        .attr("font-size", "12px")
        .attr("fill", "var(--ink-faded)")
        .text("0 mentions");
    });

    // Caption
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", CONFIG.height - 20)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Philosopher', serif")
      .attr("font-size", "11px")
      .attr("fill", "var(--ink-ghost)")
      .attr("font-style", "italic")
      .text("Data: Avatar: The Last Airbender transcripts (Kaggle)");

    // Initial render with full totals
    renderDots(data.totals);

    // Build the character selector dropdown
    buildControls(data);
  });

  function generateDotsInPath(pathElement, count) {
    const dots = [];
    const maxAttempts = count * 50;
    let attempts = 0;
    const bbox = pathElement.getBBox();

    while (dots.length < count && attempts < maxAttempts) {
      const x = bbox.x + Math.random() * bbox.width;
      const y = bbox.y + Math.random() * bbox.height;
      if (pathElement.isPointInFill(new DOMPoint(x, y))) {
        dots.push([x, y]);
      }
      attempts++;
    }

    while (dots.length < count) {
      const x = bbox.x + Math.random() * bbox.width;
      const y = bbox.y + Math.random() * bbox.height;
      dots.push([x, y]);
    }

    return dots;
  }
})();
