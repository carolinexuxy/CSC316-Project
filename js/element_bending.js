(function () {
  const CONFIG = {
    width: 820,
    height: 780,
    symbolSize: 220,
    dotRadius: 3,
    dotOpacity: 0.75,
    gridGap: 60,
    topPadding: 90,
    bottomPadding: 60,
    animationDuration: 2000,
    animationStagger: 3,
  };

  // Element definitions: color, grid position, and SVG path for shape
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

  d3.json("data/processed/element_bending.json").then(function (data) {
    const totals = data.totals;

    const svg = d3
      .select("#frame2")
      .append("svg")
      .attr("width", CONFIG.width)
      .attr("height", CONFIG.height)
      .attr("viewBox", `0 0 ${CONFIG.width} ${CONFIG.height}`)
      .style("display", "block")
      .style("margin", "0 auto");

    // Background
    svg.append("rect")
      .attr("width", CONFIG.width)
      .attr("height", CONFIG.height)
      // .attr("fill", "#1a1a2e")
      .attr("rx", 12);

    // Title
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Georgia', 'Times New Roman', serif")
      .attr("font-size", "32px")
      .attr("font-style", "italic")
      // .attr("fill", "#e0d6c8")
      .text("Meet the Elements");

    // Subtitle
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", 75)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Georgia', serif")
      .attr("font-size", "13px")
      // .attr("fill", "#9e9e9e")
      .text("How often each element's bending is referenced across all 61 episodes");

    // Grid layout
    const gridWidth = CONFIG.symbolSize * 2 + CONFIG.gridGap;
    const gridStartX = (CONFIG.width - gridWidth) / 2;
    const gridStartY = CONFIG.topPadding;

    // Hidden paths used for point-in-shape testing
    const hiddenGroup = svg.append("g").attr("opacity", 0);

    // Build each element's dot shape
    ELEMENTS.forEach(function (element) {
      const count = totals[element.key];
      const offsetX = gridStartX + element.col * (CONFIG.symbolSize + CONFIG.gridGap);
      const offsetY = gridStartY + element.row * (CONFIG.symbolSize + CONFIG.gridGap + 40);

      const group = svg.append("g")
        .attr("transform", `translate(${offsetX}, ${offsetY})`);

      const hiddenPath = hiddenGroup.append("path")
        .attr("d", element.path)
        .attr("fill", "black");

      // Generate random dots inside the shape via rejection sampling
      const dots = generateDotsInPath(hiddenPath.node(), count);

      // Render dots with animated entrance
      group.selectAll("circle")
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

      // Faint outline
      group.append("path")
        .attr("d", element.path)
        .attr("fill", "none")
        .attr("stroke", element.color)
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.1);

      // Element name
      group.append("text")
        .attr("x", CONFIG.symbolSize / 2 + 10)
        .attr("y", CONFIG.symbolSize + 28)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Georgia', serif")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", element.color)
        .text(element.name);

      // Mention count
      group.append("text")
        .attr("x", CONFIG.symbolSize / 2 + 10)
        .attr("y", CONFIG.symbolSize + 46)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Helvetica Neue', Arial, sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "#888")
        .text(count + " mentions");
    });

    // Caption
    svg.append("text")
      .attr("x", CONFIG.width / 2)
      .attr("y", CONFIG.height - 25)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Helvetica Neue', Arial, sans-serif")
      .attr("font-size", "13px")
      .attr("fill", "#777")
      .text("* Each dot represents a time that element's bending was referenced in the transcript");

    // Source
    // svg.append("text")
    //   .attr("x", CONFIG.width / 2)
    //   .attr("y", CONFIG.height - 8)
    //   .attr("text-anchor", "middle")
    //   .attr("font-family", "'Helvetica Neue', Arial, sans-serif")
    //   .attr("font-size", "10px")
    //   .attr("fill", "#555")
    //   .text("Data: Avatar: The Last Airbender transcripts (Kaggle) · Visualization by Jodhvir");

    hiddenGroup.remove();
  });

  // Generates random points inside an SVG path using rejection sampling
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

    // Fallback if shape is too small for all dots
    while (dots.length < count) {
      const x = bbox.x + Math.random() * bbox.width;
      const y = bbox.y + Math.random() * bbox.height;
      dots.push([x, y]);
    }

    return dots;
  }
})();
