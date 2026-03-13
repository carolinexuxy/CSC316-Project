/**
 * themes_timeline.js
 *
 * Usage:
 *   <script src="js/themes_timeline.js"></script>
 *   <script src="js/themes.js"></script>   ← contains: new Timeline(data, {mountId:"frame6"}).initVis()
 *
 * Expects your CSS file to style:
 *   #atla-subtitle, #atla-filters, .atla-btn, .atla-btn.active, .atla-btn.inactive,
 *   #atla-vis, #atla-tooltip, #atla-tooltip.visible, .atla-tt-inner,
 *   #atla-tt-label, #atla-tt-title, #atla-tt-themes, #atla-tt-desc
 */

class Timeline {

    // ── CONFIG ──────────────────────────────────────────

    static THEMES = [
        { name: "war",        label: "War",        color: "#b84e10",  words:
                "war, " +
                "genocide, " +
                "Air Nomads, " +
                "refugees, " +
                "colonization, " +
                "Phoenix King, "+
                "invasion, " +
                "suffering, "+
                "my people, " +
                "loss"},
        { name: "balance",    label: "Balance",    color: "#6a8a9c", words:
                "balance," +
                "harmony," +
                "four nations," +
                "avatar cycle," +
                "restore," +
                "spirit," +
                "avatar state," +
                "four elements," +
                "equilibrium," +
                "peace," +
                "natural order," +
                "spirit world"},
        { name: "destiny",    label: "Destiny",    color: "#235e8c",  words:
                "destiny," +
                "choose," +
                "path," +
                "who you are," +
                "make your own," +
                "meant to be," +
                "honor," +
                "duty," +
                "train," +
                "learn," +
                "I'm a kid," +
                "I'm the avatar," +
                "my own person," +
                "decide," +
                "to master"},
        { name: "redemption", label: "Redemption", color: "#4a6a22", words:
                "redeem," +
                "forgive," +
                "change," +
                "second chance," +
                "sorry," +
                "honor," +
                "weakness," +
                "regret," +
                "shame," +
                "make amends," +
                "past mistakes"},
    ];


    static BOOK_COLORS = {
        Water: { tint: "rgba(35,94,140,0.07)",  label: "#235e8c" },
        Earth: { tint: "rgba(74,106,34,0.07)",  label: "#4a6a22" },
        Fire:  { tint: "rgba(184,78,16,0.07)",  label: "#b84e10" },
    };

    static FINALE_INFO = {
        Water: {
            episode: "The Siege of the North",
            desc: "In order to save the Southern Water Tribe from the Fire Nation, Aang must seek the help of the spirits.",
            quotes: {
                war:        "'He's the Fire Nation's greatest threat. As long as he's alive... he must be found.'",
                balance:    "'Our strength comes from the Spirit of the Moon. Our life comes from the Spirit of the Ocean. They work together to keep balance.'",
                destiny:    "'I can't fight them all.'\n" +
                    "'But, you have to. You're the Avatar.'\n" +
                    "'I'm just one kid.'",
                redemption: "'I must capture the Avatar and restore my honor'",
            }
        },
        Earth: {
            episode: "The Crossroads of Destiny",
            desc: "As Ba Sing Se, an Earth Kingdom city, fends off an insider attack, Zuko faces a crucial decision in his quest to restore his honour.",
            quotes: {
                war:        "'The Fire Nation took my mother away from me'",
                balance:    "'Power and perfection are overrated. I think you are wise to choose happiness and love'",
                destiny:    "'I've always had to struggle and fight and that's made me strong. It's made me who I am.'",
                redemption: "'Pride is not the opposite of shame, but its source.'",
            }
        },
        Fire: {
            episode: "Sozin's Comet, Part 4",
            desc: "In the final showdown, old foes meet in battle for the last time and Aang must decide if he is willing to compromise his morals for the sake of restoring peace.",
            quotes: {
                war:        "'Fire Lord Ozai, you and your forebears have devastated the balance of this world. Now you shall pay the ultimate price.'\n" +
                            "'Even if I did defeat him, I don't know if I could take a life. I just don't think I can.'",
                balance:    "'The true mind can weather all the lies and illusions without being lost. The true heart can tough the poison of hatred without being harmed. Since beginning-less time, darkness thrives in the void, but always yields to purifying light'",
                destiny:    "'The monks used to say that revenge is like a two-headed rat viper. While you watch your enemy go down, you're being poisoned yourself.'",
                redemption: "'It’s easy to do nothing, it’s hard to forgive.'",
            }
        },
    };

    static BOOKS      = ["Water", "Earth", "Fire"];
    static DRAW_ORDER = ["war", "redemption", "destiny", "balance"];

    // ── CONSTRUCTOR ──────────────────────────────────────

    constructor(data, opts = {}) {
        this.data         = data;
        this.mountId      = opts.mountId ?? null;
        this.W            = opts.width   ?? 1140;
        this.H            = opts.height  ?? 480;
        this.margin       = opts.margin  ?? { top: 60, right: 80, bottom: 52, left: 55 };
        this.pathGroups   = {};
        this.finaleDots = {};
        this.activeThemes = new Set(["war", "balance", "destiny", "redemption"]);
    }

    // ── PUBLIC ───────────────────────────────────────────

    initVis() {
        this._prepareData();
        this._mountDOM();
        this._setupSVG();
        this._buildScales();
        this._drawBookZones();
        this._drawThemes();
        this._drawBaseline();
        this._drawFinaleMarkers();
        this._drawAxis();
        this._bindButtons();
    }

    // ── DATA ─────────────────────────────────────────────

    _prepareData() {
        // give each chapter a global index across all three books
        let offset = 0;
        Timeline.BOOKS.forEach(book => {
            const chapters = this.data.filter(d => d.book === book);
            chapters.forEach(d => { d.globalChapter = d.chapter_num + offset; });
            offset += d3.max(chapters, d => d.chapter_num);
        });
        this.maxGlobal = d3.max(this.data, d => d.globalChapter);

        // find the last chapter of each book for the finale markers
        this.finales = Timeline.BOOKS.map(book => {
            const chapters = this.data.filter(d => d.book === book);
            const last = chapters.reduce((a, b) => a.chapter_num > b.chapter_num ? a : b);
            return { ...last, ...Timeline.FINALE_INFO[book] };
        });
    }

    // ── DOM ──────────────────────────────────────────────

    _mountDOM() {
        const mount = this.mountId
            ? document.getElementById(this.mountId)
            : document.body;

        // filter buttons — one per theme
        const filters = document.createElement("div");
        filters.id = "atla-filters";
        Timeline.THEMES.forEach(t => {
            const btn = document.createElement("button");
            btn.className = "atla-btn active";
            btn.dataset.theme = t.name;
            btn.textContent = t.label;
            btn.style.borderColor = t.color;
            btn.style.color = t.color;
            filters.appendChild(btn);
        });

        // svg element
        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.id = "atla-vis";

        // tooltip
        const tooltip = document.createElement("div");
        tooltip.id = "atla-tooltip";
        tooltip.innerHTML = `
            <div class="atla-tt-inner">
                <p id="atla-tt-label"></p>
                <p id="atla-tt-title"></p>
                <div id="atla-tt-themes"></div>
                <p id="atla-tt-desc"></p>
            </div>`;

        mount.append(filters, svgEl, tooltip);
        this._tooltip = tooltip;
    }

    // ── SVG SETUP ────────────────────────────────────────

    _setupSVG() {
        this.svg = d3.select("#atla-vis")
            .attr("viewBox", `0 0 ${this.W} ${this.H}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "500px");


        this.svg.append("text")
            .attr("x", this.W / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-family", "Philosopher, serif")
            .attr("font-style", "italic")
            .attr("font-size", 40)
            .attr("fill", "#5a3e22")
            .attr("opacity", 0.75)
            .text("Thematic weight across the seasons");
    }


    // ── SCALES ───────────────────────────────────────────

    _buildScales() {
        const { margin, W, H, data, maxGlobal } = this;

        this.x = d3.scaleLinear()
            .domain([1, maxGlobal])
            .range([margin.left, W - margin.right]);

        const maxVal = d3.max(data, d => Math.max(d.war, d.balance, d.destiny, d.redemption));
        this.midY = H - margin.bottom - 30;

        this.y = d3.scaleLinear()
            .domain([0, maxVal])
            .range([this.midY, margin.top]);
    }

    // ── DRAWING ──────────────────────────────────────────

    _drawBookZones() {
        const { svg, data, x, margin, H } = this;

        Timeline.BOOKS.forEach(book => {
            const chapters = data.filter(d => d.book === book);
            const x0 = x(d3.min(chapters, d => d.globalChapter) - 0.5);
            const x1 = x(d3.max(chapters, d => d.globalChapter) + 0.5);
            const bc = Timeline.BOOK_COLORS[book];

            // tinted background rect
            svg.append("rect")
                .attr("x", x0).attr("y", margin.top - 10)
                .attr("width", x1 - x0)
                .attr("height", H - margin.top - margin.bottom + 10)
                .attr("fill", bc.tint);

            // book label
            svg.append("text")
                .attr("x", (x0 + x1) / 2).attr("y", margin.top - 18)
                .attr("text-anchor", "middle")
                .attr("font-size", 11).attr("fill", bc.label).attr("opacity", 0.8)
                .attr("font-family", "Philosopher, serif")
                .text(`Book ${book}`);

            // separator line between books
            if (book !== "Fire") {
                svg.append("line")
                    .attr("x1", x1).attr("x2", x1)
                    .attr("y1", margin.top - 10).attr("y2", H - margin.bottom)
                    .attr("stroke", "rgba(44,31,14,0.13)").attr("stroke-dasharray", "3,5");
            }
        });
    }

    _drawThemes() {
        const { svg, data, x, y, midY } = this;

        Timeline.DRAW_ORDER.forEach(name => {
            const t = Timeline.THEMES.find(t => t.name === name);

            const area = d3.area()
                .x(d => x(d.globalChapter))
                .y0(midY).y1(d => y(d[name]))
                .curve(d3.curveCatmullRom.alpha(0.5));

            const line = d3.line()
                .x(d => x(d.globalChapter))
                .y(d => y(d[name]))
                .curve(d3.curveCatmullRom.alpha(0.5));

            const g = svg.append("g").attr("class", `theme-group theme-${name}`);

            // filled area under the line
            g.append("path")
                .datum(data).attr("d", area)
                .attr("fill", t.color).attr("opacity", 0.12);

            // the line itself with draw-on animation
            const linePath = g.append("path")
                .datum(data).attr("d", line)
                .attr("fill", "none")
                .attr("stroke", t.color)
                .attr("stroke-width", name === "war" ? 2.2 : 1.6);

            const len = linePath.node().getTotalLength();
            linePath
                .attr("stroke-dasharray", len)
                .attr("stroke-dashoffset", len)
                .transition().duration(2000).ease(d3.easeCubicInOut)
                .attr("stroke-dashoffset", 0);

            // right-edge label at the last data point
            const last = data[data.length - 1];
            g.append("text")
                .attr("x", x(last.globalChapter) + 6)
                .attr("y", y(last[name]) + 4)
                .attr("font-family", "Uncial Antiqua, cursive")
                .attr("font-size", 10).attr("fill", t.color).attr("opacity", 0.85)
                .text(t.label);

            const positions = {
                war:        { x: 300,  y: 500 },
                balance:    { x: 400,  y: 515 },
                destiny:    { x: 400,  y: 530 },
                redemption: { x: 400,  y: 545 },
            };
            g.append("text")
                .attr("x", 500)
                .attr("y", positions[name].y)
                .attr("text-anchor", "middle")
                .attr("font-size", 11)
                .attr("font-family", "Uncial Antiqua, cursive")
                .attr("fill", t.color)
                .attr("opacity", 0.75)
                .text("Key Words:    " + t.words);

            this.pathGroups[name] = { g, linePath, len };
        });
    }

    _drawBaseline() {
        const { svg, margin, W, midY } = this;
        svg.append("line")
            .attr("x1", margin.left).attr("x2", W - margin.right)
            .attr("y1", midY).attr("y2", midY)
            .attr("stroke", "rgba(44,31,14,0.2)").attr("stroke-width", 1);
    }

    _drawFinaleMarkers() {
        const { svg, x, margin, H, finales, _tooltip } = this;
        const y = this.y;

        // one overlay group appended after all theme groups
        // so it is always on top in SVG z-order — this is what
        // fixes the wrong-theme hover bug
        const overlay = svg.append("g").attr("class", "finale-overlay");

        finales.forEach(f => {
            const book        = f.book;
            const chapter_num = f.chapter_num;
            const desc        = f.desc;
            const quotes      = f.quotes;
            const fx          = x(f.globalChapter);
            const bc          = Timeline.BOOK_COLORS[book].label;

            // vertical dashed line
            overlay.append("line")
                .attr("x1", fx).attr("x2", fx)
                .attr("y1", margin.top - 10).attr("y2", H - margin.bottom)
                .attr("stroke", bc).attr("stroke-dasharray", "3,5").attr("opacity", 0.4);

            // main finale dot at top
            const dot = overlay.append("circle")
                .attr("cx", fx).attr("cy", margin.top - 4)
                .attr("r", 5).attr("fill", bc).attr("opacity", 0.8)
                .style("cursor", "pointer");

            // repeating pulse ring
            const pulse = () => {
                overlay.append("circle")
                    .attr("cx", fx).attr("cy", margin.top - 4).attr("r", 5)
                    .attr("fill", "none").attr("stroke", bc).attr("opacity", 0.5)
                    .transition().duration(1400).ease(d3.easeCubicOut)
                    .attr("r", 16).attr("opacity", 0).remove();
            };
            pulse();
            setInterval(pulse, 2000);

            // "Finale" label below axis
            overlay.append("text")
                .attr("x", fx).attr("y", H - margin.bottom + 40)
                .attr("text-anchor", "middle")
                .attr("font-size", 9).attr("fill", bc).attr("opacity", 0.6)
                .attr("font-family", "Philosopher, serif")
                .text("Finale");

            // main dot tooltip — shows all themes
            dot.on("mouseenter", (evt) => {
                document.getElementById("atla-tt-label").textContent = `Book ${book} · Chapter ${chapter_num}`;
                document.getElementById("atla-tt-title").textContent = f.episode;
                document.getElementById("atla-tt-themes").innerHTML  = Timeline.THEMES
                    .map(t => `<span style="color:${t.color}">${t.label}: <b>${f[t.name]}</b></span>`)
                    .join("  ");
                document.getElementById("atla-tt-desc").textContent  = desc;
                _tooltip.classList.add("visible");
                this._moveTip(evt);
            })
                .on("mousemove",  (evt) => this._moveTip(evt))
                .on("mouseleave", ()    => _tooltip.classList.remove("visible"));

            // per-theme dots — reversed so highest lines are on top in SVG z-order
            [...Timeline.THEMES].reverse().forEach(t => {
                const name  = t.name;
                const label = t.label;
                const py    = y(f[name]);
                const score = f[name];
                const quote = quotes[name];

                // visible dot
                const visibleDot = overlay.append("circle")
                    .attr("cx", fx).attr("cy", py)
                    .attr("r", 5)
                    .attr("fill", t.color).attr("opacity", 0.5)
                    .style("pointer-events", "none");

                // per season invisible dot for tooltip hover
                overlay.append("circle")
                    .attr("cx", fx).attr("cy", py)
                    .attr("r", 8)
                    .attr("fill", "transparent")
                    .style("cursor", "pointer")
                    .on("mouseenter", (evt) => {
                        if (!this.activeThemes.has(name)) return;
                        document.getElementById("atla-tt-label").textContent = `Book ${book} · Chapter ${chapter_num}`;
                        document.getElementById("atla-tt-title").textContent = `${label}: ${score}`;
                        document.getElementById("atla-tt-themes").innerHTML  = "";
                        document.getElementById("atla-tt-desc").textContent  = quote || desc;
                        _tooltip.classList.add("visible");
                        this._moveTip(evt);
                    })
                    .on("mousemove",  (evt) => this._moveTip(evt))
                    .on("mouseleave", ()    => _tooltip.classList.remove("visible"));

                // toggle visibility
                if (!this.finaleDots) this.finaleDots = {};
                if (!this.finaleDots[name]) this.finaleDots[name] = [];
                this.finaleDots[name].push(visibleDot);
            });
        });
    }

    _drawAxis() {
        const { svg, x, data, H, margin, maxGlobal } = this;

        svg.append("g")
            .attr("transform", `translate(0, ${H - margin.bottom + 4})`)
            .call(
                d3.axisBottom(x)
                    .ticks(maxGlobal)
                    .tickFormat(d => {
                        const match = data.find(r => r.globalChapter === d);
                        return match ? match.chapter_num : "";
                    })
            )
            .call(g => g.select(".domain").attr("stroke", "rgba(44,31,14,0.2)"))
            .call(g => g.selectAll("line").attr("stroke", "rgba(44,31,14,0.15)"))
            .call(g => g.selectAll("text").attr("fill", "rgba(44,31,14,0.5)").attr("font-size", 9));
    }

    // ── INTERACTIONS ─────────────────────────────────────

    _bindButtons() {
        document.querySelectorAll(".atla-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const name = btn.dataset.theme;
                const pg   = this.pathGroups[name];

                if (this.activeThemes.has(name)) {
                    // hide
                    this.activeThemes.delete(name);
                    btn.classList.replace("active", "inactive");
                    pg.g.transition().duration(300).style("opacity", 0);
                    this.finaleDots[name].forEach(d => d.style("opacity", 0));
                } else {
                    // show with redraw animation
                    this.activeThemes.add(name);
                    btn.classList.replace("inactive", "active");
                    pg.g.transition().duration(200).style("opacity", 1);
                    this.finaleDots[name].forEach(d => d.style("opacity", 0.5));
                    pg.linePath
                        .attr("stroke-dasharray",  pg.len)
                        .attr("stroke-dashoffset", pg.len)
                        .transition().duration(900).ease(d3.easeCubicInOut)
                        .attr("stroke-dashoffset", 0);
                }
            });
        });
    }

    _moveTip(evt) {
        const tw = 280, th = 160;
        this._tooltip.style.left = (evt.clientX + 16 + tw > window.innerWidth  ? evt.clientX - tw - 16 : evt.clientX + 16) + "px";
        this._tooltip.style.top  = (evt.clientY + 16 + th > window.innerHeight ? evt.clientY - th - 16 : evt.clientY + 16) + "px";
    }
}