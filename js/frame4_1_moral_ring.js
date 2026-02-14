/* js/frame3_1_rings.js
   Layout: left character buttons + right ring chart (800x800)
   Data: data/processed/moral_counts_tidy.csv
   Columns: chap_global, book_num, chapter_num, character, word, count_norm
*/

(function () {
  const DATA_PATH = "data/processed/moral_counts_tidy.csv";
  const DIV_ID = "#frame4_1";

  // Overall layout sizes
  // const LEFT_W = 220;
  const WIDTH = 800;
  const HEIGHT = 800;

  const ringGap = 10;
  const minRingThickness = 1;
  const maxRingThickness = 40;
  const margin = 40;

  const ringOrder = ["conflict_doubt", "identity", "compassion", "justice", "duty_honor"];

  const ringLabel = new Map([
    ["conflict_doubt", "Conflict & Doubt"],
    ["identity", "Identity"],
    ["compassion", "Compassion"],
    ["justice", "Justice"],
    ["duty_honor", "Duty & Honor"],
  ]);

  const ringColor = new Map([
    ["conflict_doubt", "#7b5cff"],
    ["identity", "#00b3b3"],
    ["compassion", "#2bb673"],
    ["justice", "#f2a900"],
    ["duty_honor", "#e84a5f"],
  ]);

  const prettyChar = (c) => c.charAt(0).toUpperCase() + c.slice(1);
  
  function getDiv() {
    const mount = d3.select(DIV_ID);
    if (mount.empty()) throw new Error(`Cannot find mount ${DIV_ID}`);
    return mount;
  }

	// create overall layout of the frame
	function buildLayout(mount) {
		// Clear existing
		mount.selectAll("*").remove();

		// Add left-right margins using container
		const container = mount.append("div")
			.attr("class", "container px-4 position-relative");

		// Bootstrap row
		const row = container.append("div")
			.attr("class", "row");

		// LEFT COLUMN (3/12)
		const leftCol = row.append("div")
			.attr("class", "col-md-3 text-center");

		// Add vertical spacing to roughly align with ring center
		const left = leftCol.append("div")
			.attr("class", "pt-5");   // Bootstrap spacing only (no flex)

		// RIGHT COLUMN (7/12) + remaining 2 columns margin automatically handled
		const rightCol = row.append("div")
			.attr("class", "col-md-7 offset-md-1 text-center");

		// // Title
		// rightCol.append("div")
		//   .attr("class", "fw-semibold mb-2")
		//   .style("font-size", "18px")
		//   .text("Character Growth Chart");

		// SVG
		const svg = rightCol.append("svg")
			.attr("width", WIDTH)
			.attr("height", HEIGHT);

		// Tooltip (absolute within container)
		const tooltip = container.append("div")
			.attr("class", "bg-dark text-white p-2 rounded small")
			.style("position", "absolute")
			.style("pointer-events", "none")
			.style("opacity", 0);

		return { container, left, rightCol, svg, tooltip };
	}

	// render chart legend 
  function renderLegend(g) {
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${-(WIDTH / 2 - 20)}, ${-(HEIGHT / 2 - 20)})`);

    const items = legend.selectAll("g.item")
      .data(ringOrder)
      .enter()
      .append("g")
      .attr("class", "item")
      .attr("transform", (d, i) => `translate(0, ${i * 18})`);

    items.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", d => ringColor.get(d) || "#999");

    items.append("text")
      .attr("x", 14)
      .attr("y", 9)
      .style("font-size", "12px")
      .style("fill", "#333")
      .text(d => ringLabel.get(d) || d);
  }

	// render book/season divider on ring 
  function renderBookDividers(g, totalChaps) {
    const dividers = [20, 40];
    const rOuter = Math.min(WIDTH, HEIGHT) / 2 - margin;

    g.append("g")
      .attr("class", "book-dividers")
      .selectAll("line")
      .data(dividers)
      .enter()
      .append("line")
      .attr("x1", d => Math.cos((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter - 5))
      .attr("y1", d => Math.sin((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter - 5))
      .attr("x2", d => Math.cos((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 10))
      .attr("y2", d => Math.sin((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 10))
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8);

    const labels = [
      { chap: 1, text: "Book 1" },
      { chap: 21, text: "Book 2" },
      { chap: 41, text: "Book 3" },
    ];

    g.append("g")
      .attr("class", "book-labels")
      .selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .attr("x", d => Math.cos((d.chap - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 22))
      .attr("y", d => Math.sin((d.chap - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 22))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "11px")
      .style("fill", "#666")
      .text(d => d.text);
  }

	// render tooltip (on hover)
  function showTooltip(container, tooltip, event, d) {
		const html = `
			<div><strong>${prettyChar(d.character)}</strong></div>
			<div>${ringLabel.get(d.word) || d.word}</div>
			<div>Book ${d.book_num}, Chapter ${d.chapter_num}</div>
			<div>(Global ${d.chap_global})</div>
			<div>count_norm: ${(+d.count_norm).toFixed(2)} per 1k words</div>
		`;

		// Position next to the cursor BUT relative to the container (not the page)
		const rect = container.node().getBoundingClientRect();
		const x = event.clientX - rect.left + 12;
		const y = event.clientY - rect.top + 12;

		tooltip.html(html)
			.style("opacity", 1)
			.style("left", `${x}px`)
			.style("top", `${y}px`);
	}


  function hideTooltip(tooltip) {
    tooltip.style("opacity", 0);
  }

  function main() {
    const mount = getDiv();
    const { container, left, svg, tooltip } = buildLayout(mount);

    d3.csv(DATA_PATH, d3.autoType).then(raw => {
      // Normalize fields
      raw.forEach(d => {
        d.chap_global = +d.chap_global;
        d.book_num = +d.book_num;
        d.chapter_num = +d.chapter_num;
        d.count_norm = +d.count_norm;
        d.character = (d.character || "").toLowerCase().trim();
        d.word = (d.word || "").toLowerCase().trim();
      });

      const characters = Array.from(new Set(raw.map(d => d.character)))
        .filter(Boolean)
        .sort(d3.ascending);

      const totalChaps = d3.max(raw, d => d.chap_global) || 61;

      const thicknessScale = d3.scaleLinear()
        .domain([0, d3.max(raw, d => d.count_norm) || 1])
        .range([minRingThickness, maxRingThickness])
        .clamp(true);

      const angleStart = (chap) => ((chap - 1) / totalChaps) * 2 * Math.PI - Math.PI / 2;
      const angleEnd = (chap) => (chap / totalChaps) * 2 * Math.PI - Math.PI / 2;

      // SVG root group
      const g = svg.append("g")
        .attr("transform", `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

      // Background
      g.append("circle")
        .attr("r", Math.min(WIDTH, HEIGHT) / 2 - margin)
        .attr("fill", "white")
        .attr("stroke", "#e5e5e5");

      renderLegend(g);
      renderBookDividers(g, totalChaps);

      // Center label
      const centerLabel = g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("");

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("y", 18)
        .style("font-size", "12px")
        .style("fill", "#666")
        .text("Hover segments for details");

      // Ring radii
      const rOuterAll = Math.min(WIDTH, HEIGHT) / 2 - margin - 20;
      const ringCount = ringOrder.length;
      const ringBand = (rOuterAll - 80) / ringCount;

      const ringRadii = ringOrder.map((word, i) => {
        const inner = 80 + i * ringBand;
        const outer = inner + ringBand - ringGap;
        return { word, inner, outer };
      });

      const ringGroups = g.append("g").attr("class", "rings")
        .selectAll("g.ring")
        .data(ringRadii)
        .enter()
        .append("g")
        .attr("class", d => `ring ring-${d.word}`);

      // Build left-side character buttons
			const buttonWrap = left.append("div")
			.attr("class", "row row-cols-1 g-3");

			const buttons = buttonWrap.selectAll("div.char-btn")
				.data(characters)
				.enter()
				.append("div")
				.attr("class", "col text-center char-btn")

      // Circle placeholder (later you can put image inside)
			buttons.append("div")
				.attr("class", "char-circle mx-auto")
				.style("width", "64px")
				.style("height", "64px")
				.style("border-radius", "50%")
				.style("background", "#d9d9d9")
				.style("border", "2px solid transparent");


      buttons.append("div")
        .attr("class", "char-name")
        .style("font-size", "13px")
        .style("color", "#333")
        .text(d => prettyChar(d));

			buttons
				.style("cursor", "pointer")
				.on("click", (event, c) => {
					event.preventDefault();
					event.stopPropagation();
					setActive(c);
				});

      function setActive(character) {
        // Visual highlight on left buttons
        buttons.select(".char-circle")
          .style("border-color", "#0000")
          .style("outline", "none");

        buttons.filter(d => d === character)
          .select(".char-circle")
          .style("border-color", "#333");

        update(character);
      }

      function update(character) {
        centerLabel.text(prettyChar(character));

        const filtered = raw.filter(d => d.character === character && ringOrder.includes(d.word));

        // safety fill for missing chapters
        const byKey = new Map(filtered.map(d => [`${d.word}__${d.chap_global}`, d]));
        const filled = [];
        for (const w of ringOrder) {
          for (let chap = 1; chap <= totalChaps; chap++) {
            const key = `${w}__${chap}`;
            const v = byKey.get(key);
            filled.push(v ? v : {
              chap_global: chap,
              book_num: chap <= 20 ? 1 : (chap <= 40 ? 2 : 3),
              chapter_num: ((chap - 1) % 20) + 1,
              character,
              word: w,
              count_norm: 0
            });
          }
        }

        ringGroups.each(function (ringInfo) {
          const ringData = filled.filter(d => d.word === ringInfo.word);

          const sel = d3.select(this)
            .selectAll("path.segment")
            .data(ringData, d => d.chap_global);

          sel.exit().remove();

          sel.enter()
            .append("path")
            .attr("class", "segment")
            .attr("fill", ringColor.get(ringInfo.word) || "#999")
            .attr("stroke", "white")
            .attr("stroke-width", 0.7)
            .attr("opacity", 0.85)
            .on("mousemove", (event, d) => showTooltip(container, tooltip, event, d))
            .on("mouseleave", () => hideTooltip(tooltip))
            .merge(sel)
            .transition()
            .duration(350)
            .attrTween("d", function (d) {
              const t = thicknessScale(d.count_norm);
              const arc = d3.arc()
                .innerRadius(ringInfo.outer - t)
                .outerRadius(ringInfo.outer)
                .startAngle(angleStart(d.chap_global))
                .endAngle(angleEnd(d.chap_global));
              return () => arc();
            });
        });
      }

      // Default active character
      const defaultChar = characters.includes("zuko") ? "zuko" : characters[0];
      setActive(defaultChar);
    }).catch(err => {
      console.error(err);
      mount.append("pre").style("color", "crimson").text(String(err));
    });
  }

  main();
})();
