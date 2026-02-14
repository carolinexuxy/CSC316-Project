// js/frame1_placeholder.js
// Frame 1 placeholder: Title + map placeholder + real explanatory text.
// Only appends to <div class="canvas" id="frame1">.

(function () {
  const mount = d3.select("#frame1");
  if (mount.empty()) return;

  mount.selectAll("*").remove();

  const W = 800;
  const H = 600;

  const svg = mount.append("svg")
    .attr("width", W)
    .attr("height", H);

  // Title
  svg.append("text")
    .attr("x", 30)
    .attr("y", 70)
    .attr("font-size", 44)
    .attr("font-weight", 800)
    .attr("fill", "#111")
    .text("IS ATLA JUST A KID SHOW?");

  // Big placeholder rectangle (map image)
  const rectX = 140;
  const rectY = 120;
  const rectW = 430;
  const rectH = 250;

  svg.append("rect")
    .attr("x", rectX)
    .attr("y", rectY)
    .attr("width", rectW)
    .attr("height", rectH)
    .attr("fill", "#d9d9d9")
    .attr("rx", 6);

  // Simple "image icon"
  const iconGroup = svg.append("g")
    .attr("transform", `translate(${rectX + rectW / 2 - 12}, ${rectY + rectH / 2 - 42})`)
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

  // "ATLA MAP" label inside placeholder
  svg.append("text")
    .attr("x", rectX + rectW / 2)
    .attr("y", rectY + rectH / 2 + 35)
    .attr("text-anchor", "middle")
    .attr("font-size", 18)
    .attr("font-weight", 700)
    .attr("fill", "#111")
    .text("ATLA MAP");

  // Real explanatory text UNDER the rectangle (no gray lines)
  const textX = rectX + rectW / 2;
  const textY = rectY + rectH + 55;
  const textWidth = rectW - 40;

  const paragraph =
    "This section will introduce the background of the question and the show of Avatar: The Last Airbender. The image will be a map of the ATLA world as a visual hook. The accompanying text will provide brief introduction of the show.";

  // Wrap paragraph into multiple lines (simple word wrap)
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

  const lines = wrapText(paragraph, 70);

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
})();
