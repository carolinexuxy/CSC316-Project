
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
                "balance, " +
                "harmony, " +
                "four nations, " +
                "avatar cycle, " +
                "restore, " +
                "spirit, " +
                "avatar state, " +
                "four elements, " +
                "equilibrium, " +
                "peace, " +
                "natural order, " +
                "spirit world"},
        { name: "destiny",    label: "Destiny",    color: "#235e8c",  words:
                "destiny, " +
                "choose, " +
                "path, " +
                "who you are, " +
                "make your own, " +
                "meant to be, " +
                "honor, " +
                "duty, " +
                "train, " +
                "learn, " +
                "I'm a kid, " +
                "I'm the avatar, " +
                "my own person, " +
                "decide, " +
                "to master"},
        { name: "redemption", label: "Redemption", color: "#4a6a22", words:
                "redeem, " +
                "forgive, " +
                "change, " +
                "second chance, " +
                "sorry, " +
                "honor, " +
                "weakness, " +
                "regret, " +
                "shame, " +
                "make amends, " +
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
                war:        "'Fire Lord Ozai, you and your forebears have devastated the balance of this world. Now you shall pay the ultimate price.'\n",
                balance:    "'The true mind can weather all the lies and illusions without being lost. The true heart can tough the poison of hatred without being harmed. Since beginning-less time, darkness thrives in the void, but always yields to purifying light'",
                destiny:    "'Even if I did defeat him, I don't know if I could take a life. I just don't think I can.'",
                redemption: "'It’s easy to do nothing, it’s hard to forgive.'",
            }
            // 'The monks used to say that revenge is like a two-headed rat viper. While you watch your enemy go down, you're being poisoned yourself.'
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
        this.margin       = opts.margin  ?? { top: 85, right: 80, bottom: 52, left: 55 };
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
        this._setupBrush();
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

        this._mount = mount;

        // vis title
        const title = document.createElement("div");
        title.style.fontFamily = "'Uncial Antiqua', cursive";
        title.style.fontSize = "28px";
        title.style.color = "#5a3e22";
        title.style.letterSpacing = "0.06em";
        title.style.marginBottom = "20px";
        title.style.marginTop = "0";
        title.textContent = "Thematic Weight Across The Show";

        // vis description
        const description = document.createElement("div");

        description.style.flexBasis = "100%";
        description.style.order = "-1";

        description.style.border = "1px solid var(--ink-faded)";
        description.style.borderRadius = "8px";
        description.style.padding = "16px 20px";
        description.style.color = "var(--ink-faded)";
        description.style.fontFamily = "'Philosopher', serif";
        description.style.fontSize = "14px";
        description.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.2)";
        description.style.maxWidth = "1100px";
        description.style.margin = "0 auto 20px auto";
        description.style.textAlign = "center";
        description.style.lineHeight = "1.6";

        // Build keywords HTML with colored badges
        const keywordsHTML = Timeline.THEMES
            .map(t => `
                <div style="display: flex; align-items: center; gap: 12px; margin: 8px 0;">
                    <span style="
                        background-color: ${t.color};
                        color: white;
                        padding: 6px 14px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 0.05em;
                        white-space: nowrap;
                    ">${t.label.toUpperCase()}</span>
                    <span style="color: ${t.color}; font-size: 13px;">${t.words}</span>
                </div>
            `)
            .join("");

        description.innerHTML = `
            <p style="margin: 0 0 16px 0; line-height: 1.7;">
                <strong>In Avatar: The Last Airbender,</strong> the themes of war, balance, destiny, and redemption flow continuously through the story. Explore how these ideas rise and fall across each chapter, and compare their relative intensity to see which themes dominate at different moments and how they evolve throughout the three books: Water, Earth, and Fire.
            </p>
            <p style="margin: 0 0 16px 0; font-size: 13px; opacity: 0.8;">
                Theme intensity is calculated by the frequency of the following theme-related keywords identified in each chapter.
            </p>
            <div style="text-align: left; display: inline-block; margin-bottom: 20px;">
                ${keywordsHTML}
            </div>
            <div style="border-top: 1px solid rgba(90,62,34,0.2); padding-top: 16px; margin-top: 16px; font-size: 13px; line-height: 1.6; color: var(--ink-faded); font-style: italic;">
                Use the theme buttons to explore how different ideas emerge and evolve throughout the story, and to compare their prominence across chapters. Hover over key points to reveal additional details. Click and drag across the graph to brush over a range of chapters to examine how theme intensity accumulates within a selected interval.
            </div>
        `;

        const container = document.createElement("div");
        container.style.width = "100%";
        container.style.textAlign = "center";

        container.appendChild(title);
        container.appendChild(description);
        mount.prepend(container);

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
            .attr("viewBox", `0 0 ${this.W} ${this.H + 90}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")

        const { margin, W, H } = this;

        // Y-axis label
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", 0 - (H / 2))
            .attr("text-anchor", "middle")
            .attr("font-family", "'Philosopher', serif")
            .attr("font-size", 12)
            .attr("fill", "#5a3e22")
            .attr("opacity", 0.7)
            .text("Theme Keyword Mentions");
    }


    // ── SCALES ───────────────────────────────────────────

    _buildScales() {
        const { margin, W, H, data, maxGlobal } = this;

        this.x = d3.scaleLinear()
            .domain([1, maxGlobal])
            .range([margin.left, W - margin.right]);

        const maxVal = d3.max(data, d => Math.max(d.war, d.balance, d.destiny, d.redemption));
        this.midY = H - margin.bottom - 30;
        this.maxVal = maxVal;

        this.y = d3.scaleLinear()
            .domain([0, maxVal])
            .range([this.midY, margin.top]);
    }

    // ── DRAWING ──────────────────────────────────────────

    _drawBookZones() {
        const { svg, data, x, margin, H, midY } = this;

        Timeline.BOOKS.forEach((book, bookIndex) => {
            const chapters = data.filter(d => d.book === book);
            // Extend more to the left for Earth and Fire to connect with previous books
            const leftExtension = bookIndex === 0 ? 0.1 : 0.9;
            const x0 = x(d3.min(chapters, d => d.globalChapter) - leftExtension);
            const x1 = x(d3.max(chapters, d => d.globalChapter) + 0.1);
            const bc = Timeline.BOOK_COLORS[book];

            // tinted background - extends from top to bottom of plot area
            svg.append("rect")
                .attr("x", x0).attr("y", margin.top - 15)
                .attr("width", x1 - x0)
                .attr("height", midY - (margin.top - 15))
                .attr("fill", bc.tint);

            // book label
            svg.append("text")
                .attr("x", (x0 + x1) / 2).attr("y", margin.top - 18)
                .attr("text-anchor", "middle")
                .attr("font-size", 11).attr("fill", bc.label).attr("opacity", 0.8)
                .attr("font-family", "Philosopher, serif")
                .text(`Book: ${book}`);

            // separator line between books
            if (book !== "Fire") {
                svg.append("line")
                    .attr("x1", x1).attr("x2", x1)
                    .attr("y1", margin.top - 15).attr("y2", midY)
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
                .attr("y1", margin.top - 10).attr("y2", H - margin.bottom - 30)
                .attr("stroke", bc).attr("stroke-dasharray", "3,5").attr("opacity", 0.4);

            // main finale dot at top
            const dot = overlay.append("circle")
                .attr("cx", fx).attr("cy", margin.top - 4)
                .attr("r", 5).attr("fill", bc).attr("opacity", 0.8)
                .style("cursor", "pointer")
                .on("mouseenter", (evt) => {
                    d3.select(evt.target)
                        .transition().duration(150)
                        .attr("r", 7);
                })
                .on("mouseleave", (evt) => {
                    d3.select(evt.target)
                        .transition().duration(150)
                        .attr("r", 5);
                });

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
                .attr("x", fx).attr("y", H - margin.bottom + 20)
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
                    .attr("fill", t.color)
                    .attr("opacity", 0.5)
                    .style("pointer-events", "none");

                //  invisible hover dots with better interactivity
                overlay.append("circle")
                    .attr("cx", fx).attr("cy", py)
                    .attr("r", 10)
                    .attr("fill", "transparent")
                    .style("cursor", "pointer")
                    .on("mouseenter", (evt) => {
                        if (!this.activeThemes.has(name)) return;
                        d3.select(evt.target)
                            .transition().duration(150)
                            .attr("r", 14)
                            .attr("fill", t.color)
                            .attr("opacity", 0.3);
                        document.getElementById("atla-tt-label").textContent = `Book ${book} · Chapter ${chapter_num}`;
                        document.getElementById("atla-tt-title").textContent = `${label}: ${score}`;
                        document.getElementById("atla-tt-themes").innerHTML  = "";
                        document.getElementById("atla-tt-desc").textContent  = quote || desc;
                        _tooltip.classList.add("visible");
                        this._moveTip(evt);
                    })
                    .on("mousemove",  (evt) => this._moveTip(evt))
                    .on("mouseleave", (evt) => {
                        d3.select(evt.target)
                            .transition().duration(150)
                            .attr("r", 10)
                            .attr("fill", "transparent")
                            .attr("opacity", 0);
                        _tooltip.classList.remove("visible");
                    });

                // toggle visibility
                if (!this.finaleDots) this.finaleDots = {};
                if (!this.finaleDots[name]) this.finaleDots[name] = [];
                this.finaleDots[name].push(visibleDot);
            });
        });
    }

    _drawAxis() {
        const { svg, x, y, data, H, margin, maxGlobal } = this;

        // X-axis
        svg.append("g")
            .attr("transform", `translate(0, ${H - margin.bottom - 25})`)
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

        // Y-axis with numbers
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(
                d3.axisLeft(y)
                    .ticks(6)
            )
            .call(g => g.select(".domain").attr("stroke", "rgba(44,31,14,0.2)"))
            .call(g => g.selectAll("line").attr("stroke", "rgba(44,31,14,0.15)"))
            .call(g => g.selectAll("text").attr("fill", "rgba(44,31,14,0.5)").attr("font-size", 9));

        // X-axis label
        svg.append("text")
            .attr("x", this.W / 2)
            .attr("y", H - margin.bottom + 32)
            .attr("text-anchor", "middle")
            .attr("font-family", "'Philosopher', serif")
            .attr("font-size", 12)
            .attr("fill", "#5a3e22")
            .attr("opacity", 0.7)
            .text("Chapters");
    }

    // ── INTERACTIONS ─────────────────────────────────────

    _bindButtons() {
        document.querySelectorAll(".atla-btn").forEach(btn => {
            const name = btn.dataset.theme;
            const pg   = this.pathGroups[name];

            btn.addEventListener("click", () => {
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
                // Update stats if there's an active brush selection
                if (this._currentBrushSelection) {
                    const event = { selection: this._currentBrushSelection };
                    this._onBrushEnd(event, this._brushData, this._statsPanel);
                }
            });

            // hover highlighting
            btn.addEventListener("mouseenter", () => {
                // dim all other theme lines
                Timeline.THEMES.forEach(t => {
                    if (t.name !== name && this.pathGroups[t.name]) {
                        this.pathGroups[t.name].linePath.style("opacity", 0.2);
                    }
                });
                // brighten the hovered theme
                if (pg && pg.linePath) {
                    pg.linePath.style("opacity", 1).style("stroke-width", 3);
                }
            });

            btn.addEventListener("mouseleave", () => {
                // restore normal opacity for all lines
                Timeline.THEMES.forEach(t => {
                    if (this.pathGroups[t.name] && this.activeThemes.has(t.name)) {
                        this.pathGroups[t.name].linePath.style("opacity", 0.7).style("stroke-width", 2);
                    }
                });
            });
        });
    }

    _moveTip(evt) {
        const tw = 280, th = 160;
        this._tooltip.style.left = (evt.clientX + 16 + tw > window.innerWidth  ? evt.clientX - tw - 16 : evt.clientX + 16) + "px";
        this._tooltip.style.top  = (evt.clientY + 16 + th > window.innerHeight ? evt.clientY - th - 16 : evt.clientY + 16) + "px";
    }

    _setupBrush() {
        const { svg, x, margin, H, data } = this;

        // Create stats panel
        const statsPanel = document.createElement("div");
        statsPanel.id = "atla-stats-panel";
        statsPanel.style.position = "relative";
        statsPanel.style.marginTop = "20px";
        statsPanel.style.padding = "16px";
        statsPanel.style.background = "rgba(255,255,255,0.3)";
        statsPanel.style.borderRadius = "8px";
        statsPanel.style.maxWidth = "900px";
        statsPanel.style.margin = "-100px auto 8px auto";
        statsPanel.style.fontFamily = "'Philosopher', serif";
        statsPanel.style.color = "#5a3e22";
        statsPanel.style.textAlign = "center";
        statsPanel.style.display = "none";
        statsPanel.style.paddingRight = "50px";
        
        // Create close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "12px";
        closeBtn.style.right = "12px";
        closeBtn.style.background = "none";
        closeBtn.style.border = "none";
        closeBtn.style.fontSize = "20px";
        closeBtn.style.color = "#5a3e22";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.transition = "opacity 0.2s";
        closeBtn.style.padding = "0";
        closeBtn.style.width = "24px";
        closeBtn.style.height = "24px";
        closeBtn.style.display = "flex";
        closeBtn.style.alignItems = "center";
        closeBtn.style.justifyContent = "center";
        closeBtn.addEventListener("mouseenter", () => closeBtn.style.opacity = "0.6");
        closeBtn.addEventListener("mouseleave", () => closeBtn.style.opacity = "1");
        closeBtn.addEventListener("click", () => {
            statsPanel.style.display = "none";
            this._currentBrushSelection = null;
            // Clear the brush
            if (this._brush) {
                svg.select(".brush").call(this._brush.move, null);
            }
        });
        statsPanel.appendChild(closeBtn);
        
        // Content div
        const content = document.createElement("div");
        statsPanel.appendChild(content);
        statsPanel._contentDiv = content;
        content.innerHTML = "<p>Select a chapter range to see statistics</p>";
        this._mount.appendChild(statsPanel);

        // Store current brush selection for updating on theme toggle
        this._currentBrushSelection = null;
        this._brushData = data;

        // Create brush
        const brush = d3.brushX()
            .extent([[margin.left, margin.top - 15], [this.W - margin.right, this.midY]])
            .on("end", (event) => {
                if (event.selection) {
                    this._currentBrushSelection = event.selection;
                    this._onBrushEnd(event, data, statsPanel);
                } else {
                    this._currentBrushSelection = null;
                    statsPanel.style.display = "none";
                }
            });

        // Add brush group
        svg.append("g")
            .attr("class", "brush")
            .call(brush);

        this._brush = brush;
        this._statsPanel = statsPanel;
    }

    _onBrushEnd(event, data, statsPanel) {
        if (!event.selection) {
            statsPanel.style.display = "none";
            return;
        }

        const [x0, x1] = event.selection.map(this.x.invert, this.x);
        const selectedChapters = data.filter(d => d.globalChapter >= x0 && d.globalChapter <= x1);

        if (selectedChapters.length === 0) {
            statsPanel.style.display = "none";
            return;
        }

        // Format chapter range by book with book numbers
        const bookChapters = {};
        selectedChapters.forEach(d => {
            if (!bookChapters[d.book]) {
                bookChapters[d.book] = [];
            }
            bookChapters[d.book].push(d.chapter_num);
        });

        let chapterLabel = "";
        const bookNumbers = { "Water": 1, "Earth": 2, "Fire": 3 };
        Timeline.BOOKS.forEach(book => {
            if (bookChapters[book]) {
                const chapters = bookChapters[book];
                const minCh = Math.min(...chapters);
                const maxCh = Math.max(...chapters);
                const bookColor = Timeline.BOOK_COLORS[book].label;
                chapterLabel += (chapterLabel ? " &nbsp;&nbsp;|&nbsp;&nbsp; " : "") + `<span style="color: ${bookColor};"><strong>Book ${bookNumbers[book]}: ${book}</strong></span> - Chapters ${minCh}-${maxCh}`;
            }
        });

        // Calculate total counts for only visible themes
        let html = `<strong>${chapterLabel}</strong><br><br>`;
        Timeline.THEMES.forEach(t => {
            // Only show themes that are currently visible
            if (!this.activeThemes.has(t.name)) return;

            const total = selectedChapters.reduce((sum, d) => sum + d[t.name], 0);
            html += `<span style="color: ${t.color}; margin: 0 16px; display: inline-block;">
                <strong>${t.label}</strong>: ${total.toFixed(0)}
            </span>`;
        });

        statsPanel._contentDiv.innerHTML = html;
        statsPanel.style.display = "block";
    }

    _toggleInstructionalTooltips() {
        if (this._showingInstructions) {
            this._createInstructionalTooltips();
            this._helpIcon.classList.add("active");
        } else {
            this._clearInstructionalTooltips();
            this._helpIcon.classList.remove("active");
        }
    }

    _createInstructionalTooltips() {
        // Clear any existing tooltips
        this._clearInstructionalTooltips();

        const { W, H, margin, x, y, maxGlobal } = this;

        // Define tooltip positions and content relative to the chart
        const tooltips = [
            {
                x: margin.left + 100,
                y: margin.top + 40,
                text: "Stacked areas show theme intensity. Higher = more prominent in that chapter"
            },
            {
                x: margin.left + 80,
                y: H - margin.bottom - 120,
                text: "Click theme buttons to toggle visibility. Use them to isolate or compare themes"
            },
            {
                x: W - margin.right - 150,
                y: margin.top + 50,
                text: "Colored book zones mark Water, Earth, and Fire books. Each has 20 chapters"
            },
            {
                x: W / 2,
                y: H - margin.bottom - 60,
                text: "Click and drag to select a chapter range. Stats panel shows totals for visible themes"
            },
            {
                x: W - margin.right - 80,
                y: margin.top + 150,
                text: "Finale dots mark book endings. Hover for episode details and theme quotes"
            },
            {
                x: W / 2,
                y: margin.top + 100,
                text: "Hover over theme buttons to highlight that theme's line. Release to see all active themes"
            }
        ];

        // Create SVG container for positioned tooltips
        this.svg.append("g").attr("class", "atla-instruction-group");

        tooltips.forEach((tip, idx) => {
            const g = this.svg.select(".atla-instruction-group").append("g")
                .attr("class", "atla-instruction-tooltip");

            // Background box
            g.append("rect")
                .attr("x", tip.x - 90)
                .attr("y", tip.y)
                .attr("width", 180)
                .attr("height", 70)
                .attr("rx", 4)
                .attr("fill", "#f0e6cc")
                .attr("stroke", "#5a3e22")
                .attr("stroke-width", 1)
                .style("filter", "drop-shadow(2px 2px 6px rgba(0,0,0,0.2))");



            // Text - split into lines
            const lines = this._wrapText(tip.text, 20);
            const tspans = g.append("text")
                .attr("x", tip.x)
                .attr("y", tip.y + 15)
                .attr("text-anchor", "middle")
                .attr("font-size", 11)
                .attr("font-family", "'Philosopher', serif")
                .attr("fill", "#5a3e22")
                .attr("pointer-events", "none");

            lines.forEach((line, i) => {
                tspans.append("tspan")
                    .attr("x", tip.x)
                    .attr("dy", i === 0 ? 0 : "1.2em")
                    .text(line);
            });
        });
    }

    _wrapText(text, charsPerLine) {
        const words = text.split(" ");
        const lines = [];
        let line = "";
        words.forEach(word => {
            if ((line + word).length > charsPerLine) {
                if (line) lines.push(line);
                line = word;
            } else {
                line += (line ? " " : "") + word;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    _clearInstructionalTooltips() {
        this.svg.selectAll(".atla-instruction-group").remove();
    }
}