// js/frame1_placeholder.js
// Frame 1 — Setting: Title + world map + intro text.
// Appends to <div class="canvas" id="frame1">

(function () {
  const mount = d3.select("#frame1");
  if (mount.empty()) return;
  mount.selectAll("*").remove();

  // ── Inject font
  if (!document.getElementById("f1-font")) {
    const link = document.createElement("link");
    link.id = "f1-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Crimson+Text:ital@0;1&display=swap";
    document.head.appendChild(link);
  }

  // ── Dimensions ───────────────────────────────────────────────────────────────
  const W = 900, H = 560;
  const PAD = 40;

  // Element palette
  const C = {
    water : "#3a7bd5",
    earth : "#6b8c3e",
    fire  : "#e05c1a",
    air   : "#d4a843",
    dark  : "#0d1117",
    parch : "#f5ead6",
    dim   : "rgba(245,234,214,0.55)",
  };

  // ── Root SVG ───
  const svg = mount.append("svg")
      .attr("width", W).attr("height", H)
      .style("background", C.dark)
      .style("display", "block");

  const defs = svg.append("defs");

  const vig = defs.append("radialGradient").attr("id","f1vig")
      .attr("cx","50%").attr("cy","50%").attr("r","70%");
  vig.append("stop").attr("offset","0%").attr("stop-color","transparent");
  vig.append("stop").attr("offset","100%").attr("stop-color","rgba(0,0,0,0.55)");

  // Thin gold border
  svg.append("rect")
      .attr("x",1).attr("y",1).attr("width",W-2).attr("height",H-2)
      .attr("fill","none").attr("stroke",C.air).attr("stroke-width",1.5)
      .attr("stroke-opacity",0.4);

  // Vignette overlay
  svg.append("rect").attr("width",W).attr("height",H).attr("fill","url(#f1vig)");

  // ── Layout constants ─────────────────────────────────────────────────────────
  const mapX = PAD, mapY = 100;
  const mapW = 460, mapH = 340;
  const textX = mapX + mapW + 36;
  const textW = W - textX - PAD;


  const titleGrad = defs.append("linearGradient").attr("id","f1titleGrad")
      .attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%");
  titleGrad.append("stop").attr("offset","0%").attr("stop-color", C.fire);
  titleGrad.append("stop").attr("offset","100%").attr("stop-color", C.air);

  // Line 1: "Is Avatar: The Last Airbender"
  svg.append("text")
      .attr("x", PAD).attr("y", 52)
      .attr("font-family","Cinzel, serif").attr("font-weight",900)
      .attr("font-size", 13).attr("letter-spacing", 3)
      .attr("fill", C.air).attr("opacity", 0.65)
      .text("IS");

  svg.append("text")
      .attr("x", PAD + 34).attr("y", 52)
      .attr("font-family","Cinzel, serif").attr("font-weight",900)
      .attr("font-size", 13).attr("letter-spacing", 3)
      .attr("fill","url(#f1titleGrad)")
      .text("AVATAR: THE LAST AIRBENDER");

  svg.append("text")
      .attr("x", PAD).attr("y", 76)
      .attr("font-family","Cinzel, serif").attr("font-weight",700)
      .attr("font-size", 22)
      .attr("fill", C.parch)
      .text("just for children?");

  // Divider line under title
  svg.append("line")
      .attr("x1", PAD)
      .attr("y1", 88)
      .attr("x2", W - PAD)
      .attr("y2", 88)
      .attr("stroke", C.air).attr("stroke-width", 0.8).attr("opacity", 0.3);

  // ── Map area ─────────────────────────────────────────────────────────────────
  // Dark backing rect
  svg.append("rect")
      .attr("x", mapX)
      .attr("y", mapY)
      .attr("width", mapW)
      .attr("height", mapH)
      .attr("fill","rgba(8,12,20,0.7)")
      .attr("rx", 3);

  // Map image
  svg.append("image")
      .attr("href", "img/atlamap.png")
      .attr("x", mapX).attr("y", mapY)
      .attr("width", mapW).attr("height", mapH)
      .attr("preserveAspectRatio","xMidYMid meet")
      .style("opacity", 0.95);

  // Map border
  svg.append("rect")
      .attr("x", mapX).attr("y", mapY)
      .attr("width", mapW).attr("height", mapH)
      .attr("fill","none")
      .attr("stroke", C.air).attr("stroke-width", 1).attr("opacity", 0.35)
      .attr("rx", 3);

  // Map caption
  svg.append("text")
      .attr("x", mapX + mapW / 2).attr("y", mapY + mapH + 18)
      .attr("text-anchor","middle")
      .attr("font-family","Cinzel, serif").attr("font-size", 9)
      .attr("letter-spacing", 3).attr("fill", C.dim)
      .text("THE FOUR NATIONS");

  // ── Four-nation colours─────────────────────────────────────────────────
  const nations = [
    { label:"Water Tribe", color: C.water },
    { label:"Earth Kingdom", color: C.earth },
    { label:"Fire Nation", color: C.fire  },
    { label:"Air Nomads",  color: C.air   },
  ];
  const chipY = mapY + mapH + 34;
  const chipSpacing = mapW / nations.length;

  nations.forEach((n, i) => {
    const cx = mapX + i * chipSpacing + chipSpacing / 2;
    svg.append("circle")
        .attr("cx", cx).attr("cy", chipY + 6)
        .attr("r", 5).attr("fill", n.color).attr("opacity", 0.85);
    svg.append("text")
        .attr("x", cx + 12).attr("y", chipY + 10)
        .attr("font-family","Cinzel, serif").attr("font-size", 8)
        .attr("letter-spacing", 1.5).attr("fill", n.color).attr("opacity", 0.8)
        .text(n.label);
  });

  // ── Introduction text  ────────────────────────────────────────────────────
  // Helper: append wrapped tspan lines to a <text> node
  function appendWrapped(textNode, str, x, lineH, maxW, fontSize) {
    const approxCharW = fontSize * 0.52;
    const maxChars = Math.floor(maxW / approxCharW);
    const words = str.split(/\s+/);
    const lines = [];
    let cur = [];
    words.forEach(w => {
      const test = [...cur, w].join(" ");
      if (test.length > maxChars) { lines.push(cur.join(" ")); cur = [w]; }
      else cur.push(w);
    });
    if (cur.length) lines.push(cur.join(" "));
    lines.forEach((l, i) => {
      textNode.append("tspan")
          .attr("x", x).attr("dy", i === 0 ? 0 : lineH)
          .text(l);
    });
    return lines.length;
  }

  // Section heading
  svg.append("text")
      .attr("x", textX).attr("y", mapY + 16)
      .attr("font-family","Cinzel, serif").attr("font-weight",700)
      .attr("font-size", 11).attr("letter-spacing", 3)
      .attr("fill", C.air).attr("opacity", 0.7)
      .text("BACKGROUND");

  // Accent bar
  svg.append("rect")
      .attr("x", textX).attr("y", mapY + 22)
      .attr("width", 32).attr("height", 1.5)
      .attr("fill", C.fire).attr("opacity", 0.7);

  // Intro paragraph
  const intro = "Avatar: The Last Airbender is an animated series that aired on Nickelodeon from 2005 to 2008. Set in a world of four nations — each tied to an element — the story follows Aang, the last surviving Airbender, on his journey to master all four elements and bring peace to a world consumed by war.";

  const introNode = svg.append("text")
      .attr("x", textX).attr("y", mapY + 46)
      .attr("font-family","Crimson Text, Georgia, serif").attr("font-size", 14)
      .attr("fill", C.parch).attr("opacity", 0.82);

  const introLines = appendWrapped(introNode, intro, textX, 21, textW, 14);

  // Second paragraph
  const followY = mapY + 46 + introLines * 21 + 24;

  svg.append("text")
      .attr("x", textX).attr("y", followY)
      .attr("font-family","Cinzel, serif").attr("font-weight",700)
      .attr("font-size", 11).attr("letter-spacing", 3)
      .attr("fill", C.air).attr("opacity", 0.7)
      .text("THE QUESTION");

  svg.append("rect")
      .attr("x", textX).attr("y", followY + 6)
      .attr("width", 32).attr("height", 1.5)
      .attr("fill", C.fire).attr("opacity", 0.7);

  const q = "Marketed to children, yet beloved by adults worldwide — does ATLA transcend its target audience?";

  const qNode = svg.append("text")
      .attr("x", textX).attr("y", followY + 28)
      .attr("font-family","Crimson Text, Georgia, serif")
      .attr("font-size", 14).attr("font-style","italic")
      .attr("fill", C.dim);

  appendWrapped(qNode, q, textX, 21, textW, 14);

  // ── Element accent dots (decorative, bottom-right) ─
  [C.water, C.earth, C.fire, C.air].forEach((c, i) => {
    svg.append("circle")
        .attr("cx", W - PAD - i * 14)
        .attr("cy", H - PAD + 10)
        .attr("r", 4)
        .attr("fill", c).attr("opacity", 0.55);
  });

})();