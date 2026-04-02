/* js/frame3_1_rings.js
   Layout: left character buttons + right ring chart (800x800)
   Data: data/processed/moral_counts_tidy.csv
   Columns: chap_global, book_num, chapter_num, character, word, count_norm
*/

(function () {
  const MORAL_DATA_PATH = "data/processed/moral_counts_tidy.csv";
  const TRAIT_DATA_PATH = "data/processed/character_traits.json";
  const DIV_ID = "#frame4-1";

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
  var ringType = 'moral' // default ring type
  
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

    // Title
		container.append("div")
		  .attr("class", "row mb-2 pt-4")
      .append("div")
      .attr("class", "col text-center") 
      .append("h2")
      .text("Character Growth Throughout the Show");

    // element legend constants
		const elements = [
			{ 
				name: "Air", 
				text: "creative • free-spirited • independent • flexible", 
				color: "#64d5d4",
        icon: "../img/air_icon.png"
			},
			{ 
				name: "Earth", 
				text: "stable • resilient • grounded • persistent", 
				color: "#76592f",
        icon: "../img/earth_icon.png"
			},
			{ 
				name: "Fire", 
				text: "ambitious • passionate • bold • energetic", 
				color: "#cc3300",
        icon: "../img/fire_icon.png"
			},
			{ 
				name: "Water", 
				text: "adaptable • empathetic • emotionally intelligent", 
				color: "#003399",
        icon: "../img/water_icon.png"
			}
			];
    
    const description = container.append("div")
      .style("border", "1px solid var(--ink-faded)")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("color", "var(--ink-faded)")
      .attr("font-family", "Philosopher, serif")
      .style("font-size", "18px")
      .style("box-shadow", "2px 2px 6px rgba(0,0,0,0.2)")
      .style("max-width", "80vw")
      .style("margin", "0 auto 60px auto");

    // traits description
    description.append("div")
      .html(`<span style="font-weight: bold"> TRAITS </span> visualizes adverbial descriptions of a character accumulated across chapters. <br>
              Character traits are organized into elements (without inherent order) where each element's core characteristics are: `);

    // trait/element legend
    const legend = description.append("div")
      .attr("class", "legend")
      .style("width", "fit-content")
      .style("margin", "12px auto")
      .style("padding", "8px 0")
      .style("display", "flex")
      .style("flex-direction", "column") 
      .style("align-items", "flex-start")  
      .style("gap", "6px")

    // legend items
    elements.forEach(el => {
      const row = legend.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "8px");

      // element icon 
      row.append("img")
        .attr("src", el.icon)          // path to icon
        .style("width", "30px")        // adjust size
        .style("height", "30px")
        .style("object-fit", "contain");

      // element label
      row.append("span")
        .style("padding", "4px 10px")
        .style("font-size", "16px")
        .style("color", el.color)
        .style("font-family", "'Uncial Antiqua',cursive")
        .style("font-weight", "extra-bold")
        .style("white-space", "nowrap")
        .text(el.name);

      // element description
      row.append("span")
        .style("font-size", "15px")
        .style("color", el.color)
        .text(el.text);
      });

    // themes description
    description.append("div")
      .style("margin-top", "8px")
      .html(`<span style="font-weight: bold"> THEMES </span> visualizes how frequently a character express a moral theme, normalized per 1,000 words of their dialogue in each chapter. <br>
            Phrases that define each moral theme in character dialogue:`);

    const themes = {
      "conflict_doubt": {
        words: [
          "maybe", "confused", "torn", "doubt", "choice", "choose", "decide",
          "regret", "should", "shouldn't", "can't", "cannot", "won't",
          "what if", "i don't know"
        ],
        color: "#7b5cff"
      },
      "identity":{ 
        words: [
          "who I am", "who we are", "myself", "yourself", "identity",
          "change", "changed", "become", "meant to be", "I am", "I'm not"
        ],
        color: "#00b3b3"
      },
      "compassion": {
        words: [
          "help", "protect", "care", "friend", "trust", "together", "save",
          "sorry", "understand", "hope", "believe", "family"
        ],
        color:"#2bb673"
      },
      "justice": {
        words: [
          "right", "wrong", "justice", "unfair", "mercy", "forgive",
          "forgiveness", "revenge", "punish", "innocent", "guilty",
          "consequence", "deserve"
        ],
        color: "#c76c00" // darker, more readable on beige
      },
      "duty_honor": { 
        words: [
          "honor", "destiny", "duty", "obligation", "responsibility",
          "redeem", "redemption", "worthy", "shame", "pride", "legacy"
        ],
        color: "#e84a5f"
      }
    }

    // theme legend
    const themeLegend = description.append("div")
      .attr("class", "legend")
      .style("width", "fit-content")
      .style("margin", "12px auto")
      .style("padding", "8px 0")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("align-items", "flex-start")
      .style("gap", "6px");

    // iterate over themes
    Object.entries(themes).forEach(([themeName, theme]) => {
      const row = themeLegend.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "12px");

      // theme label
      row.append("span")
        .style("padding", "4px 10px")
        .style("border-radius", "999px")
        .style("background-color", ringColor.get(themeName))
        .style("color", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("white-space", "nowrap")
        .text(themeName.replace("_", " | ").toUpperCase());

      // words associated with theme
      row.append("span")
        .style("font-size", "14px")
        .style("color", theme.color)
        .text(theme.words.join(" • "));
    });

    // instruction footer
    description.append("div")
      .style("font-style", "italic")
      .style("font-size", "16px")
      .style("text-align", "center")
      .style("margin-top", "40px")
      .text("Toggle between these two visualizations to explore the rich character development and the meaningful themes that make the story engaging for viewers of all ages.");

		// Bootstrap row
		const row = container.append("div")
			.attr("class", "row");

    // left column for characters / ring type selection
		const leftCol = row.append("div")
			.attr("class", "col-md-2 d-flex text-center")

		// toggle ring type panel
		const panel = leftCol.append("div")
			.attr("class", "d-flex flex-column justify-content-center align-items-center gap-4")

		// center for main ring viz
		const centre = row.append("div")
			.attr("class", "col-md-10 text-center")

		// SVG
		const svg = centre.append("svg")
			.attr("width", WIDTH)
			.attr("height", HEIGHT)
      .attr("margin-top", "16px")
      .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)  // preserves aspect ratio
      .attr("preserveAspectRatio", "xMidYMid meet") // keep ratio, center it
      .style("background-color", "var(--parchment)")
      .style("display", "block"); 

		// Tooltip (absolute within container)
		const tooltip = container.append("div")
			.attr("class", "atla-tt-inner")
			.style("position", "absolute")
			.style("pointer-events", "none")
			.style("opacity", 0);

		return { container, panel, centre, svg, tooltip };
	}

    // render buttons to toggle between moral and trait axes
    // svg - drawing area of the visualization
    // toggle_g - drawing area of toggle buttons
    // elementalRings - instance of ElementalRing class
    // updateMoral - function to update moral rings
    // moralGroup - drawing area of moral rings
  function renderToggle(svg, toggle_g, elementalRings, updateMoral, moralGroup) {          
    // hint to tell user to select "trait" or "theme"
    const hint = toggle_g.append("div")
      .text("Click to toggle")
      .attr("class", "toggle-hint")
      .style("font-size", "14px")
      .style("padding", "4px")
      .style("border-radius", "8px")
      .style("margin-top", "6px")
      .style("opacity", 1);
    
    // flash hint
    let flashInterval = setInterval(() => {
        hint.transition()
            .duration(400)
            .style("opacity", hint.style("opacity") == 1 ? 0.3 : 1);
    }, 400);

    const toggleButtons = [
      { text: "Trait", type: "trait" },
      { text: "Theme", type: "moral" }
    ];

    const buttons = [];

    function activateButton(d, btn) {
      
      toggle_g.selectAll("button")
        .classed("inactive", true);

      btn.classed("inactive", false);

      if (d.type === "moral") {
        ringType = "moral";
        elementalRings.wrangleData(null);
        updateMoral(selectedCharacter);
        moralGroup.attr("display", "");
        svg.selectAll(".legend").attr("opacity", 1);
      } else {
        ringType = "trait";
        elementalRings.wrangleData(prettyChar(selectedCharacter));
        moralGroup.attr("display", "none");
        svg.selectAll(".legend").attr("opacity", 0);
      }
  }

  // create buttons
  toggleButtons.forEach((d) => {
    const isActive = d.type === "moral";

    const btn = toggle_g.append("button")
      .text(d.text)
      .attr("class", "atla-btn")
      .classed("inactive", !isActive)
      .style("color", "var(--ink-faded)")
      .style("font-size", "16px")
      .style("width", "100%")
      .on("click", () => {

        // remove hint if user toggles viz
        if (hint && d.type !== ringType) {
          hint.style("background-color", "")
          clearInterval(flashInterval);
        }
        activateButton(d, btn);
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
      .style("font-size", "15px")
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
      .attr("y1", d => Math.sin((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter - 2))
      .attr("x2", d => Math.cos((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 10))
      .attr("y2", d => Math.sin((d - 1) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 10))
      .attr("stroke", "var(--ink)")
      .attr("stroke-width", 1);

    const labels = [
      { chap: 1, text: "Book 1: Water", 
        "x": Math.cos((0) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 40),
        "y": Math.sin((0) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 30) + 5
      },
      { chap: 21, text: "Book 2: Earth",
        "x": Math.cos((20) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 40) + 3,
        "y": Math.sin((20) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 30) + 15
      },
      { chap: 41, text: "Book 3: Fire",
        "x": Math.cos((40) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 40) - 5,
        "y": Math.sin((40) / totalChaps * 2 * Math.PI - Math.PI / 2) * (rOuter + 30) + 15
      },
    ];

    g.append("g")
      .attr("class", "book-labels")
      .selectAll("text")
      .data(labels)
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "14px")
      .style("fill", "var(--ink)")
      .text(d => d.text);
  }

	// render tooltip (on hover)
  function showTooltip(container, tooltip, event, d) {
		const html = `
    <div style="border-bottom:1px solid rgba(44,31,14,0.2);padding-bottom:6px;margin-bottom:6px;">
      <strong style="font-family:'Uncial Antiqua',cursive;font-size:18px;">${prettyChar(d.character)}</strong>
    </div>
    <div style="font-size:14px; color:#2c1f0e; line-height:1.2;">
      <p style="margin:4px 0;">
        <span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Theme:</span> ${d.word.replace("_", " | ").toUpperCase()}
      </p>
      <p style="margin:4px 0;">
        <span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Book:</span> ${d.book_num}
      </p>
      <p style="margin:4px 0;">
        <span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Chapter:</span> ${d.chapter_num}
           <p style="margin:4px 0; font-size: 14px">
        <span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Normalized Count:</span> ${(+d.count_norm).toFixed(2)} per 1k words
      </p>
			</div>
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
    const { container, panel, svg, tooltip } = buildLayout(mount);

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
      const toggle_g = panel.append("div")
			                  .attr("class", "panel")
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

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("y", -HEIGHT / 2 + 40)
        .attr("x", WIDTH / 2 - 100)
        .style("font-size", "14px")
        .style("fill", "#666")
        .text("Hover data for details");

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
			const buttonWrap = panel.append("div")
			.attr("class", "col-auto d-flex flex-column scrollbox")
      .style("max-height", "60vh")
      .style("overflow-y", "auto");

			const buttons = buttonWrap.selectAll("div.char-btn")
				.data(characters)
				.enter()
				.append("div")
				.attr("class", "col text-center char-btn")
        .style("padding", "8px");
      

      // Circle placeholder
			buttons.append("div")
				.attr("class", "char-circle mx-auto atla-btn")
				.style("width", "80px")
				.style("height", "80px")
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
