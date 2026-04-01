const elements = ["Water", "Fire", "Earth", "Air"]

const ringGap = 1
// colour palletes for each element
const waterColors = ['#1A99FF','#1A80E6', '#1A66CC', '#4D99FF', '#3380FF', '#006BFF', '#005CCC', '#004D99', '#004080', '#003366'];
const earthColors = ['#bfb198', '#b09f7f', '#a18d66', '#927c50', '#846b3d', '#76592f', '#664d28','#58421f','#493617', '#3c2b0f'];
const fireColors = ['#8b0000', '#990000', '#a60000', '#b30000', '#bf1a00','#cc3300','#d94c00', '#e66400', '#f07f00', '#ff9900'];
const airColors = ['#b7e7ed', '#a3e9ea', '#85ede8', '#7ae6e2', '#70dedc', '#64d5d4','#59ccc9', '#4fc2bf', '#44b8b4', '#3daeaa'];

const colors = [waterColors, fireColors, earthColors, airColors]

class ElementalRings {
	
// constructor method to initialize ElementalRings object
constructor(fullData, svg, width, height, innerRadius = 100, outerRadius = 320) {

	this.fullData = fullData
	this.data = fullData["Sokka"];

	this.innerRadius = innerRadius + ringGap; // of innermost ring
	this.outerRadius = outerRadius
	this.ringWidth = (outerRadius - 4 * ringGap) / 4; // width of each ring
	this.ringOutlines = [] // borders between rings
	this.ringLabel = 0 // the max frequency count of each ring layer

	this.svg = svg;
	this.width = width;
	this.height = height;
	this.colorScale = []

	// attributes per ring
	this.displayData = [];
	this.dataCategories = [];
	this.radius = [];
	this.radialArea = [];
	this.angle = []; // same for all rings, may be redundant
	this.stackedData = [];
	

	// initialize categories and colour scale for each element
	for (let i = 0; i < 4; i++) {
		// get all adverbs from data
		this.dataCategories[i] = Object.keys(this.data[elements[i]][0]).filter(d=>d !== "chap")

		// prepare colors for range
		let colorArray = this.dataCategories[i].map( (d,j) => {
			return colors[i][j%10]
		})

		// Set ordinal color scale
		this.colorScale[i] = d3.scaleOrdinal()
			.domain(this.dataCategories[i])
			.range(colorArray);
	}

}

	/*
	 * Method that initializes the visualization (static content, e.g. SVG area or axes)
 	*/
	initVis(){
		
		let vis = this;
		vis.margin = {top: 40, right: 40, bottom: 60, left: 40};
		vis.width = 800;
		vis.height = 800;

		vis.tooltip = d3.select("body").append('div')
			.attr('class', 'atla-tt-inner')
			.style("position", "absolute")
			.style("opacity", 0)
			.style("pointer-events", "none")
			.style("max-width", "400px");

		// initialize ring outlines and labels
		for (let i = 0; i < 5; i++) {
			vis.ringOutlines[i] = vis.svg.append("circle")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", vis.innerRadius + vis.ringWidth * i) 
				.attr("stroke", "#b9c754") 
				.attr("fill", "none")
				.attr("stroke-width", 1)
				.attr("opacity", 0)
		}


		vis.ringLabel = vis.svg.append("text")
			.attr("x", 0)
			.attr("y", - (vis.innerRadius + vis.ringWidth * 4) - 4)
			.attr("width", 40)
			.attr("text-anchor", "middle")
			.attr("font-size", "11px")
			.attr("fill", "#999");

		vis.description = vis.svg.append('text')
			.attr("text-anchor", "middle")
			.attr("y", vis.height / 2 - 30)
			.attr("display", "none")
			.attr("fill", "var(--ink-faded)")
			.text(`Scroll down to see the character's element mentions!`)
		

			
	}
    /**
	 * Initializes each ring within the same svg element.
	 * Sets up scales, data, and chart generator.
	 * Different scales per character
	 */
	initRings() {
		let vis = this
		
		for (let i = 0; i < 4; i++) {
			// Radius scale
			vis.radius[i] = d3.scaleSqrt()
				.range([vis.innerRadius + vis.ringWidth*i + ringGap*(i + 1), 
						vis.innerRadius + vis.ringWidth*(i+1), + ringGap*(i+2)]);
		
			// Angle scale (same for all rings)
			vis.angle[i] = d3.scaleLinear()
				.domain(d3.extent(vis.data[elements[i]], d => d.chap))
				.range([0, 2 * Math.PI]);

			// Stack layout
			let stack = d3.stack()
				.keys(vis.dataCategories[i]);

			vis.stackedData[i] = stack(vis.data[elements[i]]);
		
			// Radial area generator
			vis.radialArea[i] = d3.areaRadial()
				.angle(d => vis.angle[i](d.data.chap))
				.innerRadius(d => vis.radius[i](d[0]))
				.outerRadius(d => vis.radius[i](d[1]))
				.curve(d3.curveCardinal);
		}

		// for when a single element in selected
		vis.focusRadius = d3.scaleSqrt()
			.range([vis.innerRadius, vis.innerRadius + vis.outerRadius - 4 * ringGap])
		vis.focusRadialArea = d3.areaRadial()
			.angle(d => vis.angle[0](d.data.chap))
			.innerRadius(d => vis.focusRadius(d[0]))
			.outerRadius(d => vis.focusRadius(d[1]))
			.curve(d3.curveCardinal)

	}

	/*
 	* Data wrangling
 	*/
	wrangleData(character){
		let vis = this;
		vis.character = character

		// if no character selected, erase visualization
		if (character === null) {
			vis.displayData = []

		}

		// else update vis with selected character
		else {
			vis.data = this.fullData[character];
			vis.initRings()
			vis.displayData = vis.stackedData
		}
		vis.updateVis();

	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/
	updateVis(){

		let vis = this;
		const capitalize = (c) => c.charAt(0).toUpperCase() + c.slice(1); // capitalize

		var erase = function() {
			// erase element rings with transition
			for (let i = 0; i < 4; i++) {
				vis.svg.selectAll(`.ring${i}`)
						.data([])
						.exit()
						.transition()
						.duration(100)
						.style("opacity", 0)
						.remove();
						
			}

			// erase ring outlines and label
			vis.ringOutlines.forEach(r => r.attr("opacity", 0).attr("stroke", "#b9c754"))
			vis.ringLabel.attr("opacity", 0)

		}

		// draw all ring elements while unfocusing elemIndex
		var allElements = function(elemIndex) {

			// link to element viz
			if (window.filterElementViz) {
				window.filterElementViz(vis.character, null)
			}
          		
			// get the max domain of all 4 rings
			const globalMax = d3.max(vis.displayData, element =>
			d3.max(element, d =>
				d3.max(d, e => e[1])
			));

			// set domain of all 4 rings
			vis.radius.forEach(r => {
				r.domain([0, globalMax]);
			});

			// show ring outlines
			vis.ringOutlines.forEach(r => r.attr("opacity", 1))

			// update ring label
			vis.ringLabel.text(globalMax)
			vis.ringLabel.attr("opacity", 1)

			// erase visualization if no character/data
			if (vis.displayData.length === 0) {
				erase()
				vis.description.attr("display", "none")
				// vis.legend.style("display", "none")
				return
			}

			// otherwise show elemental ring vis
			vis.description.attr("display", "")
			// vis.legend.style("display", "none")

			var drawRing = function(i) {
				let categories = vis.svg.selectAll(`.ring${i}`)
											.data(vis.displayData[i]);
				categories.enter().append("path")
					.attr("class", `ring${i}`)
					.style("fill", "white") 
					.style("cursor", "pointer")
					.merge(categories)
					.on('mousemove', function(event, d){

						// mouse coordinates
						const [mx, my] = d3.pointer(event, vis.svg.node());
						let angle = Math.atan2(my, mx) + Math.PI/2;
						if (angle < 0) angle += 2 * Math.PI;

						const chapterIndex = Math.floor(angle / (2 * Math.PI) * 61);
						const yValue = d[chapterIndex][1] - d[chapterIndex][0];

						// highligh element layer
						vis.ringOutlines[i].attr("stroke", "black")
						vis.ringOutlines[i + 1].attr("stroke", "black")

						// show tooltip
						vis.tooltip
							.style("opacity", 1)
							.style("left", event.pageX + 20 + "px")
							.style("top", event.pageY + "px")
							.html(`
								<div style="border-bottom:1px solid rgba(44,31,14,0.2);padding-bottom:6px;margin-bottom:6px;">
									<strong style="font-family:'Uncial Antiqua',cursive;font-size:18px;">${vis.character}</strong>
								</div>
								<div style="font-size:14px; color:#2c1f0e; line-height:1.2;">
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;">ELEMENT: <span style="color:${colors[i][5]};font-weight:bold; font-size: 16px">${elements[i]}</span>
									</p>
									<p style="margin:4px 0; font-size: 14px">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Trait:</span> ${capitalize(d.key)}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Count:</span> ${yValue}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Book:</span> ${chapterIndex === 60 ? 3 : Math.floor(chapterIndex / 20) + 1}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Chapter:</span> ${chapterIndex === 60 ? 21 : chapterIndex % 20 + 1}
									</p>
									<p style="margin:8px 0 0 0; font-size:10px;color:#5a3e22;font-style:italic;">Click to enlarge</p>
								</div>`);
					})	
					.on('mouseout', function(event, d){
						// unhighlight element
						vis.ringOutlines[i].attr("stroke", "#b9c754")
						vis.ringOutlines[i + 1].attr("stroke", "#b9c754")

						vis.tooltip
							.style("opacity", 0)
							.style("left", 0)
							.style("top", 0)
							.html(``);
					})
					.on('click', function(event, d) {
						focusElement(parseInt(this.className["animVal"].charAt(4)));
					})
					.transition()
					.duration(500)
					.style("fill", d => vis.colorScale[i](d.key))
					.attr("d", d => vis.radialArea[i](d));

				categories.exit().remove();
			}

			// unfocus element
			if (elemIndex !== undefined) {
				drawRing(elemIndex)
			}

			// draw rings with transitions by layers
			for (let i = 0; i < 4; i++) {
				// skip unfocusing element if already redrawn
				if (i == elemIndex)
					continue
				// stagger start time between layers
				((i) => {
					setTimeout(() => {
						drawRing(i)},
					// skip elemIndex layer if already drawn, and wait for elemIndex to be drawn
					((elemIndex && (i > elemIndex) ? i - 1 : i) * 300) + (elemIndex ? 500: 0)); 
				})(i);
			}
		}

		// enlarge element layer
		var focusElement = function(elemIndex) {

			// link to element viz
			if (window.filterElementViz) {
				window.filterElementViz(vis.character, elements[elemIndex].toLowerCase())
			}

			// erase current rings
			erase()
			
			// erase inner 3 ring outlines
			vis.ringOutlines.forEach((r, i) => r.attr("opacity", i < 4 ? 0 : 1))

			// update domain of focusRadius scale
			const domainMax = d3.max(vis.displayData[elemIndex], d =>
										d3.max(d, e => e[1]))
			vis.focusRadius.domain([0, domainMax]);

			// update ring outline label
			vis.ringLabel.text(domainMax)
			vis.ringLabel.attr("opacity", 1)

			let categories = vis.svg.selectAll(`.ring${elemIndex}`)
				.data(vis.displayData[elemIndex]);

			// draw enlarged element layers
			categories.enter().append("path")
				.attr("class", `ring${elemIndex}`)
				.style("fill", "white")  
				.merge(categories)
				.on('mousemove', function(event, d){

					// mouse coordinates
					const [mx, my] = d3.pointer(event, vis.svg.node());
					let angle = Math.atan2(my, mx) + Math.PI/2;
					if (angle < 0) angle += 2 * Math.PI;

					const chapterIndex = Math.floor(angle / (2 * Math.PI) * 61);
					const yValue = d[chapterIndex][1] - d[chapterIndex][0];
					vis.ringOutlines[4].attr("stroke", "black");

					// show tooltip
					vis.tooltip
						.style("opacity", 1)
						.style("left", event.pageX + 20 + "px")
						.style("top", event.pageY + "px")
						.html(`
								<div style="border-bottom:1px solid rgba(44,31,14,0.2);padding-bottom:6px;margin-bottom:6px;">
									<strong style="font-family:'Uncial Antiqua',cursive;font-size:18px;">${vis.character}</strong>
								</div>
								<div style="font-size:14px; color:#2c1f0e; line-height:1.2;">
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;">ELEMENT: <span style="color:${colors[elemIndex][5]};font-weight:bold; font-size: 16px">${elements[elemIndex]}</span>
									</p>
									<p style="margin:4px 0; font-size: 14px">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Trait:</span> ${capitalize(d.key)}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Count:</span> ${yValue}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Book:</span> ${chapterIndex === 60 ? 3 : Math.floor(chapterIndex / 20) + 1}
									</p>
									<p style="margin:4px 0;">
										<span style="font-size:12px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Chapter:</span> ${chapterIndex === 60 ? 21 : chapterIndex % 20 + 1}
									</p>
									<p style="margin:8px 0 0 0; font-size:10px;color:#5a3e22;font-style:italic;">Click to shrink</p>
								</div>`);
				})	
				.on('mouseout', function(event, d){
					vis.ringOutlines[4].attr("stroke", "#b9c754");
					vis.tooltip
						.style("opacity", 0)
						.style("left", 0)
						.style("top", 0)
						.html(``);
				})
				.on('click', function(event, d) {
					vis.ringOutlines[4].attr("stroke", "#b9c754");
					allElements(elemIndex)
				})
				.transition()
				.duration(1500)
				.style("fill", d => vis.colorScale[elemIndex](d.key))
				.attr("d", d => vis.focusRadialArea(d));

			categories.exit().remove();
		}

		// draw all elemental rings
		allElements()
		
	}
}