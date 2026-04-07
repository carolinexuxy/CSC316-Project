(function () {
    const mount = d3.select("#frame1");
    if (mount.empty()) return;
    mount.selectAll("*").remove();

    const content = {
        sections: [
            {
                heading: 'Background',
                type: 'text',
                body: 'Avatar: The Last Airbender aired on Nickelodeon from 2005 to 2008. Set across four nations — each tied to a classical element — the story follows Aang, the last surviving Airbender, on his journey to master all four elements and end a century of war.',
            },
            {
                heading: 'The Question',
                type: 'quote',
                body: 'Marketed to children, yet beloved by adults worldwide — explore the magic system, conflicts, character growth and thematic arcs to understand exactly how this show transcends its target audience ',
            },
        ],
        nations: [
            { name: 'Water', desc: 'Fluid & adaptive',    color: "#4A6E82", details: "The Water Tribes value community and change. Their bending style, based on Tai Chi, emphasizes fluidity and adaptability, requiring the bender to maintain balance, energy, and coordination. In battle, Waterbending often involves turning your opponent's attack into one of your own. This style of bending can also be used as a form of healing." },
            { name: 'Earth', desc: 'Resolute & enduring', color: "#747849", details: "Earth is an element of substance, and the people of The Earth Kingdom are strong-willed and enduring. Earthbending requires a firm stance and 'neutral jing'—the ability to wait and listen before striking. The Toph, the Avatar's blind, Earthbending master, uses her abilities to see through vibrations in the ground." },
            { name: 'Fire',  desc: 'Driven & intense',    color: "#A35232", details: "The Fire Nation army is the main antagonist of the story. Fire is the element of power, and people of the Fire Nation are proud, ambitious and unflinching. Firebending is the only element where the bender creates their own element from internal heat and breath. They have an intense and aggressive attacking style. The first firebenders were the dragons." },
            { name: 'Air',   desc: 'Free & spiritual',    color: "#B89B5E", details: "The Air Nomads are known for their spiritual connections and were a peaceful culture, who valued all life and tried to rise above worldly concerns. Airbending, based on Baguazhang martial arts, is a highly defensive and incredibly mobile style where the bender, if adept enough, can behave like a leaf and find the path of least resistance, slipping through any conflict to rise above their opponents." },
        ],
    };

    const W = 900, PAD = 50;
    const textW = W - PAD * 2;

    const svg = mount.append("svg")
        .attr("viewBox", `0 0 ${W} 100`)  // height updated at end
        .attr("width", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");

    // shadows / highlights
    const shadow = defs.append("filter").attr("id", "rusticShadow");
    shadow.append("feDropShadow").attr("dx", 0).attr("dy", 2).attr("stdDeviation", 2).attr("flood-opacity", 0.3);

    const glow = defs.append("filter").attr("id", "activeGlow")
        .attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    glow.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    const titleGrad = defs.append("linearGradient").attr("id", "titleGrad")
        .attr("gradientUnits", "userSpaceOnUse").attr("x1", PAD).attr("x2", PAD + 400);
    titleGrad.append("stop").attr("offset", "0%").attr("stop-color", "#e05c1a");
    titleGrad.append("stop").attr("offset", "100%").attr("stop-color", "#d4a843");

    // title
    svg.append("text").attr("x", PAD).attr("y", 46)
        .attr("font-family", "Uncial Antiqua, cursive").attr("font-size", 28).attr("fill", "#5a3e22")
        .text("Is");
    svg.append("text").attr("x", PAD + 38).attr("y", 46)
        .attr("font-family", "Uncial Antiqua, cursive").attr("font-size", 28).attr("fill", "url(#titleGrad)")
        .text("Avatar: The Last Airbender");
    svg.append("text").attr("x", PAD + 498).attr("y", 46)
        .attr("font-family", "Uncial Antiqua, cursive").attr("font-size", 28).attr("fill", "#5a3e22")
        .text("For Adults?");

    svg.append("line")
        .attr("x1", PAD).attr("x2", W - PAD).attr("y1", 58).attr("y2", 58)
        .attr("stroke", "#5a3e22").attr("stroke-width", 0.7).attr("stroke-opacity", 0.35);

    function wrap(textNode, str, x, lineH, maxW, fontSize, ratio) {
        const charW = fontSize * (ratio || 0.54);
        const maxChars = Math.floor(maxW / charW);
        const words = str.split(" ");
        let line = [], lines = [];
        words.forEach(w => {
            const test = line.concat(w).join(" ");
            if (line.length && test.length > maxChars) {
                lines.push(line.join(" "));
                line = [w];
            } else {
                line.push(w);
            }
        });
        if (line.length) lines.push(line.join(" "));
        lines.forEach((l, i) =>
            textNode.append("tspan").attr("x", x).attr("dy", i === 0 ? 0 : lineH).text(l)
        );
        return lines.length;
    }

    let curY = 100;

    content.sections.forEach(sec => {
        svg.append("text")
            .attr("x", PAD)
            .attr("y", curY)
            .attr("font-size", 10)
            .attr("letter-spacing", 2)
            .attr("fill", "#5a3e22")
            .attr("opacity", 0.6)
            .text(sec.heading.toUpperCase());
        curY += 16;
        const node = svg.append("text")
            .attr("x", PAD)
            .attr("y", curY)
            .attr("font-size", 13)
            .attr("font-family", "Philosopher, serif")
            .attr("fill", "#3b2a1a");

        const lines = wrap(node, sec.body, PAD, 19, textW, 13, 0.52);
        curY += lines * 19 + 22;
    });

    // Element section
    curY += 6;
    svg.append("text")
        .attr("x", PAD).attr("y", curY)
        .attr("fill", "#5a3e22")
        .attr("font-size", 18)
        .attr("font-weight", 700)
        .attr("font-family", "Uncial Antiqua, cursive")
        .text("Meet the Elements");

    svg.append("text")
        .attr("x", PAD + 232)
        .attr("y", curY)
        .attr("font-size", 9)
        .attr("letter-spacing", 2)
        .attr("fill", "#5a3e22")
        .attr("opacity", 0.5)
        .text("— SELECT TO EXPLORE EACH ELEMENTAL NATION");

    svg.append("line")
        .attr("x1", PAD).attr("x2", W - PAD).attr("y1", curY + 8).attr("y2", curY + 8)
        .attr("stroke", "#5a3e22").attr("stroke-width", 0.7).attr("stroke-opacity", 0.35);

    // element cards
    const cardY = curY + 22;
    const cardW = (textW - 30) / 4;
    const cardH = 64;

    const infoY = cardY + cardH + 12;
    const infoLineH = 18;
    const infoFontSize = 12;

    const infoInnerW = textW - 28;
    const infoRatio = 0.51;

    const infoSpot = svg.append("g").attr("class", "info-spot").style("opacity", 0);
    const infoBg = infoSpot.append("rect")
        .attr("x", PAD).attr("y", infoY)
        .attr("width", textW).attr("height", 0)
        .attr("rx", 4).attr("fill", "none");
    const infoContent = infoSpot.append("text")
        .attr("x", PAD + 14).attr("y", infoY + 22)
        .attr("font-size", infoFontSize).attr("fill", "#3b2a1a")
        .attr("font-family", "Philosopher, serif");

    content.nations.forEach((n, i) => {
        const x = PAD + i * (cardW + 10);
        const group = svg.append("g").style("cursor", "pointer").attr("class", "card-container");

        const rect = group.append("rect")
            .attr("x", x).attr("y", cardY)
            .attr("width", cardW).attr("height", cardH)
            .attr("rx", 4).attr("fill", n.color).attr("opacity", 0.55)
            .attr("filter", "url(#rusticShadow)");

        group.append("text").attr("x", x + 12).attr("y", cardY + 24)
            .attr("font-size", 13).attr("fill", "#3b2a1a")
            .attr("font-family", "Uncial Antiqua, cursive").attr("font-weight", 700)
            .text(n.name);

        group.append("text").attr("x", x + 12).attr("y", cardY + 42)
            .attr("font-size", 10).attr("fill", "#3b2a1a").attr("opacity", 0.8)
            .attr("font-family", "Philosopher, serif")
            .text(n.desc);

        group.on("click", function () {
            const isActive = rect.attr("filter") === "url(#activeGlow)";

            // Reset
            d3.selectAll(".card-container rect").transition().duration(200)
                .attr("filter", "url(#rusticShadow)").attr("opacity", 0.55).attr("transform", "translate(0,0)");

            if (isActive) {
                infoSpot.transition().duration(200).style("opacity", 0);
                svg.attr("viewBox", `0 0 ${W} ${infoY + 20}`);
                return;
            }

            rect.transition().duration(200)
                .attr("filter", "url(#activeGlow)").attr("opacity", 0.85).attr("transform", "translate(0,-4)");

            infoContent.selectAll("*").remove();
            const lineCount = wrap(infoContent, n.details, PAD + 14, infoLineH, infoInnerW, infoFontSize, infoRatio);

            const infoH = 16 + lineCount * infoLineH + 16;
            infoBg.attr("fill", n.color).attr("opacity", 0.15).attr("height", infoH);
            svg.attr("viewBox", `0 0 ${W} ${infoY + infoH + 20}`);

            infoSpot.transition().duration(250).style("opacity", 1);
        });
    });

    svg.attr("viewBox", `0 0 ${W} ${infoY + 20}`);

})();