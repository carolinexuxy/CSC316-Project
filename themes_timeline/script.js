const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 140, right: 120, bottom: 140, left: 220 };
const rowHeight = 170;
const animationDuration = 15000;

const defs = svg.append("defs");

const themes = [
    { name: "balance", element: "Air", color: "#cbd5e1" },
    { name: "war", element: "Fire", color: "#f97316" },
    { name: "destiny", element: "Water", color: "#38bdf8" },
    { name: "redemption", element: "Earth", color: "#84cc16" }
];

const bookOrder = ["Water", "Earth", "Fire"];

/* ==========================
  DATA
========================== */


const data = [
    {chapter_num:1,balance:4,destiny:10,war:78,redemption:8,book:"Water"},
    {chapter_num:2,balance:6,destiny:8,war:110,redemption:10,book:"Water"},
    {chapter_num:3,balance:5,destiny:11,war:68,redemption:22,book:"Water"},
    {chapter_num:4,balance:5,destiny:16,war:100,redemption:20,book:"Water"},
    {chapter_num:5,balance:5,destiny:19,war:38,redemption:12,book:"Water"},
    {chapter_num:6,balance:1,destiny:7,war:73,redemption:11,book:"Water"},
    {chapter_num:7,balance:25,destiny:2,war:34,redemption:2,book:"Water"},
    {chapter_num:8,balance:6,destiny:12,war:45,redemption:11,book:"Water"},
    {chapter_num:9,balance:4,destiny:8,war:19,redemption:12,book:"Water"},
    {chapter_num:10,balance:0,destiny:6,war:74,redemption:10,book:"Water"},
    {chapter_num:11,balance:5,destiny:6,war:32,redemption:10,book:"Water"},
    {chapter_num:12,balance:4,destiny:16,war:40,redemption:38,book:"Water"},
    {chapter_num:13,balance:41,destiny:3,war:46,redemption:8,book:"Water"},
    {chapter_num:14,balance:1,destiny:21,war:54,redemption:9,book:"Water"},
    {chapter_num:15,balance:3,destiny:8,war:34,redemption:27,book:"Water"},
    {chapter_num:16,balance:1,destiny:30,war:33,redemption:5,book:"Water"},
    {chapter_num:17,balance:6,destiny:2,war:68,redemption:7,book:"Water"},
    {chapter_num:18,balance:4,destiny:18,war:25,redemption:13,book:"Water"},
    {chapter_num:19,balance:19,destiny:7,war:75,redemption:13,book:"Water"},
    {chapter_num:20,balance:50,destiny:13,war:60,redemption:4,book:"Water"},

    {chapter_num:1,balance:32,destiny:18,war:84,redemption:30,book:"Earth"},
    {chapter_num:2,balance:2,destiny:6,war:38,redemption:14,book:"Earth"},
    {chapter_num:3,balance:1,destiny:13,war:77,redemption:14,book:"Earth"},
    {chapter_num:4,balance:2,destiny:3,war:24,redemption:11,book:"Earth"},
    {chapter_num:5,balance:12,destiny:13,war:39,redemption:17,book:"Earth"},
    {chapter_num:6,balance:1,destiny:6,war:57,redemption:11,book:"Earth"},
    {chapter_num:7,balance:1,destiny:5,war:73,redemption:4,book:"Earth"},
    {chapter_num:8,balance:3,destiny:14,war:74,redemption:18,book:"Earth"},
    {chapter_num:9,balance:11,destiny:14,war:19,redemption:11,book:"Earth"},
    {chapter_num:10,balance:12,destiny:7,war:33,redemption:24,book:"Earth"},
    {chapter_num:11,balance:3,destiny:4,war:47,redemption:10,book:"Earth"},
    {chapter_num:12,balance:2,destiny:3,war:20,redemption:8,book:"Earth"},
    {chapter_num:13,balance:0,destiny:9,war:43,redemption:25,book:"Earth"},
    {chapter_num:14,balance:5,destiny:13,war:68,redemption:35,book:"Earth"},
    {chapter_num:15,balance:2,destiny:7,war:10,redemption:18,book:"Earth"},
    {chapter_num:16,balance:1,destiny:30,war:31,redemption:12,book:"Earth"},
    {chapter_num:17,balance:8,destiny:9,war:31,redemption:11,book:"Earth"},
    {chapter_num:18,balance:2,destiny:9,war:44,redemption:9,book:"Earth"},
    {chapter_num:19,balance:19,destiny:24,war:39,redemption:8,book:"Earth"},
    {chapter_num:20,balance:17,destiny:17,war:55,redemption:26,book:"Earth"},

    {chapter_num:1,balance:9,destiny:6,war:55,redemption:10,book:"Fire"},
    {chapter_num:2,balance:0,destiny:6,war:40,redemption:6,book:"Fire"},
    {chapter_num:3,balance:12,destiny:2,war:41,redemption:14,book:"Fire"},
    {chapter_num:4,balance:1,destiny:24,war:91,redemption:7,book:"Fire"},
    {chapter_num:5,balance:0,destiny:6,war:39,redemption:8,book:"Fire"},
    {chapter_num:6,balance:18,destiny:16,war:44,redemption:33,book:"Fire"},
    {chapter_num:7,balance:0,destiny:9,war:22,redemption:10,book:"Fire"},
    {chapter_num:8,balance:13,destiny:11,war:45,redemption:16,book:"Fire"},
    {chapter_num:9,balance:0,destiny:19,war:43,redemption:19,book:"Fire"},
    {chapter_num:10,balance:4,destiny:2,war:89,redemption:2,book:"Fire"},
    {chapter_num:11,balance:2,destiny:12,war:100,redemption:14,book:"Fire"},
    {chapter_num:12,balance:4,destiny:18,war:35,redemption:12,book:"Fire"},
    {chapter_num:13,balance:4,destiny:25,war:93,redemption:20,book:"Fire"},
    {chapter_num:14,balance:1,destiny:7,war:40,redemption:10,book:"Fire"},
    {chapter_num:15,balance:1,destiny:6,war:88,redemption:8,book:"Fire"},
    {chapter_num:16,balance:0,destiny:4,war:53,redemption:23,book:"Fire"},
    {chapter_num:17,balance:9,destiny:10,war:43,redemption:17,book:"Fire"},
    {chapter_num:18,balance:4,destiny:10,war:48,redemption:14,book:"Fire"},
    {chapter_num:19,balance:25,destiny:21,war:33,redemption:14,book:"Fire"},
    {chapter_num:20,balance:1,destiny:6,war:102,redemption:10,book:"Fire"},
    {chapter_num:21,balance:14,destiny:9,war:41,redemption:9,book:"Fire"}
];

/* ==========================
   CONTINUOUS TIMELINE
========================== */

let chapterOffset = 0;
let bookOffsets = {};

bookOrder.forEach(book => {
    const chapters = data.filter(d => d.book === book);
    const maxChapter = d3.max(chapters, d => d.chapter_num);

    bookOffsets[book] = chapterOffset;

    chapters.forEach(d => {
        d.globalChapter = d.chapter_num + chapterOffset;
    });

    chapterOffset += maxChapter;
});

const maxGlobalChapter = d3.max(data, d => d.globalChapter);

const x = d3.scaleLinear()
    .domain([1, maxGlobalChapter])
    .range([margin.left, width - margin.right]);

/* ==========================
   BACKGROUND IMMERSIVE PARTICLES
========================== */

function backgroundParticles() {

    for (let i = 0; i < 80; i++) {

        const p = svg.append("circle")
            .attr("cx", Math.random() * width)
            .attr("cy", Math.random() * height)
            .attr("r", Math.random() * 2 + 1)
            .attr("fill", "white")
            .attr("opacity", 0.04);

        function drift() {
            p.transition()
                .duration(8000 + Math.random() * 5000)
                .attr("cx", Math.random() * width)
                .attr("cy", Math.random() * height)
                .on("end", drift);
        }

        drift();
    }
}

backgroundParticles();

/* ==========================
   ELEMENT-SPECIFIC PARTICLES
========================== */

function elementParticles(type, xPos, yPos, color) {

    if (type === "Fire") {
        svg.append("circle")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 3)
            .attr("fill", color)
            .transition()
            .duration(800)
            .attr("cy", yPos - 30)
            .attr("opacity", 0)
            .attr("r", 0)
            .remove();
    }

    if (type === "Water") {
        svg.append("circle")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 2)
            .attr("fill", color)
            .transition()
            .duration(900)
            .attr("cy", yPos + 25)
            .attr("opacity", 0)
            .remove();
    }

    if (type === "Air") {
        svg.append("circle")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 4)
            .attr("fill", color)
            .attr("opacity", 0.2)
            .transition()
            .duration(1500)
            .attr("cx", xPos - 40)
            .attr("opacity", 0)
            .remove();
    }

    if (type === "Earth") {
        svg.append("circle")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 3)
            .attr("fill", color)
            .transition()
            .duration(900)
            .attr("cx", xPos - 20)
            .attr("cy", yPos + 15)
            .attr("opacity", 0)
            .remove();
    }
}

/* ==========================
   RIDERS
========================== */

function createRider(type, color) {

    const g = svg.append("g");

    if (type === "Air") {
        g.append("path")
            .attr("d", "M0,0 Q6,-8 12,0 T24,0")
            .attr("stroke", color)
            .attr("fill", "none")
            .attr("stroke-width", 2);
    }

    if (type === "Fire") {
        g.append("path")
            .attr("d", "M6,18 Q12,0 18,18 T30,18")
            .attr("fill", color);
    }

    if (type === "Water") {
        g.append("path")
            .attr("d", "M0,10 Q10,0 20,10 T40,10")
            .attr("stroke", color)
            .attr("fill", "none")
            .attr("stroke-width", 3);
    }

    if (type === "Earth") {
        g.append("circle")
            .attr("r", 6)
            .attr("fill", color);
    }

    return g;
}

/* ==========================
   DRAW
========================== */

themes.forEach((themeObj, i) => {

    const yOffset = margin.top + i * rowHeight;

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[themeObj.name])])
        .range([yOffset + 50, yOffset - 60]);

    const area = d3.area()
        .x(d => x(d.globalChapter))
        .y0(yOffset + 50)
        .y1(d => y(d[themeObj.name]))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const line = d3.line()
        .x(d => x(d.globalChapter))
        .y(d => y(d[themeObj.name]))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const clipId = "clip-" + i;

    const clip = defs.append("clipPath")
        .attr("id", clipId);

    const clipRect = clip.append("rect")
        .attr("x", margin.left)
        .attr("y", yOffset - 100)
        .attr("width", 0)
        .attr("height", rowHeight);

    const ribbon = svg.append("path")
        .datum(data)
        .attr("d", area)
        .attr("fill", themeObj.color)
        .attr("opacity", 0.6)
        .attr("clip-path", `url(#${clipId})`);

    const topLine = svg.append("path")
        .datum(data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", themeObj.color)
        .attr("stroke-width", 3)
        .attr("clip-path", `url(#${clipId})`);

    const rider = createRider(themeObj.element, themeObj.color);

    const length = topLine.node().getTotalLength();

    rider.transition()
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attrTween("transform", function () {

            return function (t) {

                const point = topLine.node().getPointAtLength(t * length);

                clipRect.attr("width", point.x - margin.left);

                if (Math.random() > 0.6) {
                    elementParticles(themeObj.element, point.x, point.y, themeObj.color);
                }

                return `translate(${point.x}, ${point.y})`;
            };
        });

    svg.append("text")
        .attr("x", margin.left - 160)
        .attr("y", yOffset - 60)
        .text(`${themeObj.element} — ${themeObj.name}`)
        .attr("fill", themeObj.color)
        .attr("font-size", 18);
});

/* ==========================
   CHAPTER LINES
========================== */

for (let i = 1; i <= maxGlobalChapter; i++) {
    svg.append("line")
        .attr("x1", x(i))
        .attr("x2", x(i))
        .attr("y1", margin.top - 40)
        .attr("y2", height - margin.bottom + 40)
        .attr("stroke", "white")
        .attr("opacity", 0.04);
}

/* ==========================
   X AXIS
========================== */

svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom + 40})`)
    .call(d3.axisBottom(x).ticks(25))
    .attr("opacity", 0.3);


