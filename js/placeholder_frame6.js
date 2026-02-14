// js/frame6_placeholder.js
// Frame 6 placeholder: top text + large image placeholder.
// Only appends to <div class="canvas" id="frame6">.

(function () {
  const mount = d3.select("#frame6");
  if (mount.empty()) return;

  mount.selectAll("*").remove();

  const W = 700;
  const H = 520;

  const svg = mount.append("svg")
    .attr("width", W)
    .attr("height", H);

  // --- Top explanatory text (full sentences) ---
  const textX = W / 2;
  const textY = 40;

  const paragraph =
    "This final section summarizes what the visualizations reveal about why ATLA is more than a typical kids’ show. We will restate the key takeaway and explain why these factors combined proves our points. We'll also include references of review and critique online (insert as a collage of text and images) to show that our main claim that 'ATLA is not just a kid show' is also supported by many others.";

  function wrapText(text, maxCharsPerLine) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = [];
    for (const w of words) {
      const test = [...line, w].join(" ");
      if (test.length > maxCharsPerLine) {
        lines.push(line.join(" "));
        line = [w];
      } else {
        line.push(w);
      }
    }
    if (line.length) lines.push(line.join(" "));
    return lines;
  }

  const lines = wrapText(paragraph, 74);

  const textBlock = svg.append("text")
    .attr("x", textX)
    .attr("y", textY)
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("fill", "#333");

  lines.forEach((line, i) => {
    textBlock.append("tspan")
      .attr("x", textX)
      .attr("dy", i === 0 ? 0 : 20)
      .text(line);
  });

  // --- Large placeholder rectangle (image) ---
  const rectX = 90;
  const rectY = 180;
  const rectW = 520;
  const rectH = 320;

  svg.append("rect")
    .attr("x", rectX)
    .attr("y", rectY)
    .attr("width", rectW)
    .attr("height", rectH)
    .attr("fill", "#d9d9d9")
    .attr("rx", 6);

  // --- Simple image icon in center ---
  const iconGroup = svg.append("g")
    .attr("transform", `translate(${rectX + rectW / 2 - 12}, ${rectY + rectH / 2 - 12})`)
    .attr("opacity", 0.75);

  iconGroup.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 24)
    .attr("height", 24)
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("stroke-width", 1.5)
    .attr("rx", 3);

  iconGroup.append("path")
    .attr("d", "M4,18 L10,12 L14,16 L20,10")
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("stroke-width", 1.5);

  iconGroup.append("circle")
    .attr("cx", 8)
    .attr("cy", 8)
    .attr("r", 2)
    .attr("fill", "#444");
})();
