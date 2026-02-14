
const elements = ["Water", "Fire", "Earth", "Air"]

/*
 * ElementalRings - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the that's provided initially
 * @param  displayData      -- the data that will be used finally (which might vary based on the selection)
 *
 * @param  focus            -- a switch that indicates the current mode (focus or stacked overview)
 * @param  selectedIndex    -- a global 'variable' inside the class that keeps track of the index of the selected area
 */

class ElementalRings {

// constructor method to initialize ElementalRings object
constructor(parentElement, data, innerRadius = 100, ringWidth = 80) {
	this.parentElement = parentElement;
	this.data = data;
	this.innerRadius = innerRadius; // of innermost ring
	this.ringWidth = ringWidth; // width of each ring

	// attributes per ring
	this.displayData = [];
	this.dataCategories = [];
	this.radius = [];
	this.radialArea = [];
	this.angle = []; // same for all rings, may be redundant
	this.stackedData = [];
	
	// colour palletes for each element
	let waterColors = ['#1A99FF','#1A80E6', '#1A66CC', '#4D99FF', '#3380FF', '#006BFF', '#005CCC', '#004D99', '#004080', '#003366'];
	let earthColors = ['#bfb198', '#b09f7f', '#a18d66', '#927c50', '#846b3d', '#76592f', '#664d28','#58421f','#493617', '#3c2b0f'];
	let fireColors = ['#8b0000', '#990000', '#a60000', '#b30000', '#bf1a00','#cc3300','#d94c00', '#e66400', '#f07f00', '#ff9900'];
	let airColors = ['#b7e7ed', '#a3e9ea', '#85ede8', '#7ae6e2', '#70dedc', '#64d5d4','#59ccc9', '#4fc2bf', '#44b8b4', '#3daeaa'];
	this.colorScale = [waterColors, fireColors, earthColors, airColors]

	// initialize categories and colour scale for each element
	for (let i = 0; i < 4; i++) {
		// get all adverbs from data
		this.dataCategories[i] = Object.keys(this.data[elements[i]][0]).filter(d=>d !== "chap")

		// prepare colors for range
		let colorArray = this.dataCategories[i].map( (d,j) => {
			return this.colorScale[i][j%10]
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

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			// position vis origin at centre of svg
			.attr("transform", `translate(${vis.width/2 + vis.margin.left}, ${vis.height/2 + vis.margin.top})`);

		// attatch tooltip
		vis.tooltip = vis.svg.append("text")
			.attr("class", "tooltip")
    		.attr("text-anchor", "middle")
			// position top right of ring
    		.attr("x", vis.width / 4)                   
    		.attr("y", -vis.height/2)
		
		
		vis.initRings() // draw each elemental ring
		vis.drawXAxis() // draw x axis for chapters

		vis.wrangleData()
		
	}
    /**
	 * Initializes each ring within the same svg element.
	 * Sets up scales, data, and chart generator.
	 */
	initRings() {
		let vis = this

		
		for (let i = 0; i < 4; i++) {
			vis.radius[i] = d3.scaleSqrt()
				.range([vis.innerRadius + vis.ringWidth*i, vis.innerRadius + vis.ringWidth*(i+1)]);
		
			// Angle scale (map chapters to 0 → 2π)
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
	}

	/**
	 * Draws the x-axis for chapters inwards along innermost ring
	 */
	drawXAxis() {
		let vis = this

		// Choose ticks
		let ticks = vis.angle[0].ticks(vis.data.length); 
		let axisRadius = vis.innerRadius;
		let tickLength = 5;

		// Create group for axis
		let xAxisGroup = vis.svg.append("g")
			.attr("class", "x-axis");

		// Draw ticks
		xAxisGroup.selectAll("line")
				.data(ticks)
				.enter()
				.append("line")
				.attr("x1", d => axisRadius * Math.cos(vis.angle[0](d) - Math.PI/2))  // outer point
				.attr("y1", d => axisRadius * Math.sin(vis.angle[0](d) - Math.PI/2))
				.attr("x2", d => (axisRadius - tickLength) * Math.cos(vis.angle[0](d) - Math.PI/2)) // inward
				.attr("y2", d => (axisRadius - tickLength) * Math.sin(vis.angle[0](d) - Math.PI/2))
				.attr("stroke", "#000");

		// Draw labels
		xAxisGroup.selectAll("text")
    			.data(ticks)
				.enter()
				.append("text")
				.attr("x", d => (axisRadius - tickLength - 15) * Math.cos(vis.angle[0](d) - Math.PI/2))
				.attr("y", d => (axisRadius - tickLength - 15) * Math.sin(vis.angle[0](d) - Math.PI/2))
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.text(d => d);

	}

	/*
 	* Data wrangling
 	*/
	wrangleData(){
		let vis = this;
	
		vis.displayData = vis.stackedData
       
		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/
	updateVis(){
		let vis = this;

		// draw each ring
		for (let i = 0; i < 4; i++) {

			// Update domain
			// Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
			vis.radius[i].domain([0, d3.max(vis.displayData[i], function(d) {
				return d3.max(d, function(e) {
					return e[1];
				});
			})
			]);

			let categories = vis.svg.selectAll(`.ring${i}`)
								.data(vis.displayData[i])  

			categories.enter().append("path")
				.attr("class", `ring${i}`)
				.merge(categories)
				.style("fill", d => {
					return vis.colorScale[i](d.key)
				})
				.attr("d", d => vis.radialArea[i](d))
				// update tooltip on hover
				.on("mouseover", (_, d) => {
					vis.tooltip.style("opacity", 1)
					vis.tooltip.text(d.key)})
				.on("mouseout", function() {
					vis.tooltip.style("opacity", 0); 
				});

			categories.exit().remove();

		}

		
	}
}