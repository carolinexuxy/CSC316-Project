/* js/frame3_1_rings.js
   Layout: left character buttons + right ring chart (800x800)
   Data: data/processed/moral_counts_tidy.csv
   Columns: chap_global, book_num, chapter_num, character, word, count_norm
*/

(function () {
  const MORAL_DATA_PATH = "data/processed/moral_counts_tidy.csv";
  const TRAIT_DATA_PATH = "data/processed/character_traits.json";
  const DIV_ID = "#frame4_1";

  // Overall layout sizes
  const WIDTH = 750;
  const HEIGHT = 750;

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

  // User-selected fields
  var selectedCharacter = "aang"
  var ringType = 'theme' // default ring type
  
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
			.attr("class", "container position-relative p-5")
      .style("background-color", "var(--parchment)")
      .style("border-radius", "8px");

    // vis description
    const description = container.append("div")
        .style("border", "1px solid var(--ink-faded)")
        .style("border-radius", "8px")
        .style("padding", "8px 12px")
        .style("color", "var(--ink-faded)")
        .style("font-family", "'Papyrus', 'Times New Roman', serif")
        .style("font-size", "14px")
        .style("box-shadow", "2px 2px 6px rgba(0,0,0,0.2)")
        .style("max-width", "800px")
        .style("margin", "0 auto")
        .style("text-align", "center")
        .text(`Characters display a wide range of traits across each nation,
               and contribute to the core themes throughout the story.
               Select characters, toggle between "Theme" and "Trait" visualizations, and hover data
               segmenets to show more information.`);

    // Title
		container.append("div")
		  .attr("class", "row mb-2 pt-4")
      .append("div")
      .attr("class", "col text-center") 
      .append("h2")
      .text("Characters Grow Throughout the Show")
      .style("color", "var(--ink)");

		// Bootstrap row
		const row = container.append("div")
			.attr("class", "row");

    // left column for characters / ring type selection
		const leftCol = row.append("div")
			.attr("class", "col-md-1 d-flex text-center")

		// toggle ring type pannel
		const pannel = leftCol.append("div")
			.attr("class", "d-flex flex-column justify-content-center align-items-center gap-4")

		// center for main ring viz
		const centre = row.append("div")
			.attr("class", "col-md-11 text-center")

    // fields for element annotations and styles
    const elements = [
      { 
        name: "Air", 
        text: "Creative, free-spirited, independent, flexible.", 
        bg: "#a3e9a3", 
        border: "#66c766", 
        color: "#336633" 
    },
    { 
        name: "Earth", 
        text: "Stable, resilient, grounded, persistent.", 
        bg: "#c69c6d", 
        border: "#8b6b3d", 
        color: "#5c3d1f" 
    },
    { 
        name: "Fire", 
        text: "Ambitious, passionate, bold, energetic.", 
        bg: "#ff9999",  
        border: "#cc3333", 
        color: "#990000" 
    },
    { 
        name: "Water", 
        text: "Adaptable, empathetic, emotionally intelligent.", 
        bg: "#99ccff",
        border: "#3366cc", 
        color: "#003399" 
    }
    ];

    // add element annotations
    const annotationRow = container.append("div")
        .attr("class", "row justify-content-center mt-3");
    const elementAnnotations = annotationRow.selectAll("div.annotation-col")
        .data(elements)
        .enter()
        .append("div")
        .attr("class", "annotation-col col-md-3 text-center mb-3")
        .each(function(d) {
            d3.select(this)
              .append("div")
              .attr("class", "annotation text-center")
              .html(`<strong>${d.name}</strong><br>${d.text}`)
              // Apply element-specific colors
              .style("background-color", d.bg)
              .style("border", `2px solid ${d.border}`)
              .style("color", d.color);
        });

    // annotation styling
    container.selectAll(".annotation")
        .style("border-radius", "8px")
        .style("padding", "8px 12px")
        .style("font-family", "'Papyrus', 'Times New Roman', serif")
        .style("font-size", "14px")
        .style("box-shadow", "2px 2px 6px rgba(0,0,0,0.2)")
        .style("max-width", "250px")
        .style("margin", "0 auto")
        .style("text-align", "center");

		// SVG
		const svg = centre.append("svg")
			.attr("width", WIDTH)
			.attr("height", HEIGHT)
      .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)  // preserves aspect ratio
      .attr("preserveAspectRatio", "xMidYMid meet") // keep ratio, center it
      .style("background-color", "var(--parchment)")
      .style("display", "block"); 

		// Tooltip (absolute within container)
		const tooltip = container.append("div")
			.attr("class", "bg-dark text-white p-2 rounded small")
			.style("position", "absolute")
			.style("pointer-events", "none")
			.style("opacity", 0);

		return { container, pannel, centre, svg, tooltip };
	}

  // render buttons to toggle between moral and trait axes
  // svg - drawing area of the visualization
  // toggle_g - drawing area of toggle buttons
  // elementalRings - instance of ElementalRing class
  // updateMoral - function to update moral rings
  // moralGroup - drawing area of moral rings
  function renderToggle(svg, toggle_g, elementalRings, updateMoral, moralGroup) {
	const toggleButtons = [
    { text: "Trait", type: "trait" },
		{ text: "Theme", type: "moral" }
		
	];

	toggleButtons.forEach(d => {
		// "trait" selected by default
		const isActive = d.type === "moral";

		const btn = toggle_g.append("button")
			.text(d.text)
			.attr("class", "atla-btn")
			.classed("inactive", !isActive)  // inactive class if not selected
      .style("color", "var(--ink-faded)")
      .style("width", "100%") 
			.on("click", () => {
				// reset all buttons
				toggle_g.selectAll("button")
					.classed("inactive", true);

				// highlight clicked button
				btn.classed("inactive", false);

				// switch visualizations
				if (d.type === "moral") {
					ringType = "moral";
					elementalRings.wrangleData(null);
					updateMoral(selectedCharacter);
					moralGroup.attr("display", "");
					svg.selectAll(".legend").attr("opacity", 1);
					d3.selectAll(".annotation")
						.style("display", "none");
				} else {
					ringType = "trait";
					elementalRings.wrangleData(prettyChar(selectedCharacter));
					moralGroup.attr("display", "none");
					svg.selectAll(".legend").attr("opacity", 0);
					d3.selectAll(".annotation")
						.style("display", "");
				}
			});
	});
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
      .attr("transform", (d, i) => `translate(0, ${i * 18})`)
      .attr("opacity", 1)

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
    const dividers = [1, 21, 41];
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
      .attr("x", d => Math.cos((d.chap - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 40))
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
    const { container, pannel, svg, tooltip } = buildLayout(mount);

    Promise.all([
      d3.csv(MORAL_DATA_PATH, d3.autoType),    // moral
      d3.json(TRAIT_DATA_PATH) // traits
    ])

    // raw data is for moral rings
    .then(([raw, trait_data]) => {
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
        .filter(Boolean);

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
        .attr("fill", "var(--parchment-lt)")
        .attr("stroke", "#e5e5e5");

      // toggle panel group
      const toggle_g = pannel.append("div")
			                  .attr("class", "pannel")
                        .style("display", "flex")
                        .style("flex-direction", "column")
                        .style("gap", "8px");

      renderLegend(g);
      renderBookDividers(g, totalChaps);

      // Center label
      const centerLabel = g.append("image")
        .attr("x", -80)  
        .attr("y", -80)     
        .attr("width", 160)  
        .attr("height", 160)
        .attr("preserveAspectRatio", "xMidYMin meet")

      // g.append("text")
      //   .attr("text-anchor", "middle")
      //   .attr("dominant-baseline", "hanging")
      //   .attr("y", 18)
      //   .style("font-size", "12px")
      //   .style("fill", "#666")
      //   .text("Hover for details");

      // Ring radii
      const rOuterAll = Math.min(WIDTH, HEIGHT) / 2 - margin - 20;
      const ringCount = ringOrder.length;
      const ringBand = (rOuterAll - 80) / ringCount;

      const ringRadii = ringOrder.map((word, i) => {
        const inner = 80 + i * ringBand;
        const outer = inner + ringBand - ringGap;
        return { word, inner, outer };
      });

      // Visualization groups
      const moralGroup = g.append("g").attr("class", "rings")
        .selectAll("g.ring")
        .data(ringRadii)
        .enter()
        .append("g")
        .attr("class", d => `ring ring-${d.word}`);

      const traitGroup = g.append("g").attr("class", "traits")
      const elementalRings = new ElementalRings(trait_data, traitGroup, WIDTH, HEIGHT, 85, rOuterAll - 80)
      elementalRings.initVis()

      // Toggle buttons
      renderToggle(g, toggle_g, elementalRings, updateMoral, moralGroup)
      
      // Build left-side character buttons
			const buttonWrap = pannel.append("div")
			.attr("class", "col-auto d-flex flex-column scrollbox")
      .style("max-height", "70vh")
      .style("overflow-y", "auto");

			const buttons = buttonWrap.selectAll("div.char-btn")
				.data(characters)
				.enter()
				.append("div")
				.attr("class", "col text-center char-btn")
        .style("padding", "8px");
      

      // Circle placeholder (later you can put image inside)
			buttons.append("div")
				.attr("class", "char-circle mx-auto atla-btn")
				.style("width", "64px")
				.style("height", "64px")
				.style("border-radius", "50%")
				.style("background", "white")
				.style("border", "2px solid transparent")
        .style("margin-top", "4px")
        .append("img")
        .attr("src", d => `img/${d}.png`) 
        .style("width", "100%")            // scale width
        .style("height", "100%")           // scale height
        .style("display", "block")
        .style("object-fit", "contain")    // show entire image
        .style("object-position", "top center"); 

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
          selectedCharacter = c
					setActive(c);
				})
        .on("mouseover", function() {
            d3.select(this).style("border", "2px solid var(--ink-ghost)")
                           .style("border-radius", "25%");
        })
        .on("mouseout", function() {
            d3.select(this).style("border", "none")
        });

      function setActive(character) {
        // Visual highlight on left buttons
        buttons.select(".char-circle")
          .style("border-color", "#0000")
          .style("outline", "none");

        buttons.filter(d => d === character)
          .select(".char-circle")
          .style("border-color", "#333");

        centerLabel.text(prettyChar(character))
                    .attr("href", `img/${character}.png`)

        if (ringType === "trait") {
            updateTrait(character);
        }

        else {
          updateMoral(character)
        }
        
      }

      // update elemental rings to specified character, or hide vis if character is null
      function updateTrait(character) {
        elementalRings.wrangleData(prettyChar(character))
      }

      // update moral rings to specified character
      function updateMoral(character) {

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

        moralGroup.each(function (ringInfo) {
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
                .startAngle(angleStart(d.chap_global) + Math.PI / 2)
                .endAngle(angleEnd(d.chap_global) + Math.PI / 2);
              return () => arc();
            });
        });
      }

      // highlight default active character
      setActive(selectedCharacter);
    }).catch(err => {
      console.error(err);
      mount.append("pre").style("color", "crimson").text(String(err));
    });

  }
  main();
})();
