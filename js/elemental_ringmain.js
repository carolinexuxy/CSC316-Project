loadData();

function loadData() {
    d3.json("data/character_data.json"). then(data=>{
        
        console.log(data)
        
        // draw chart
		areachart = new ElementalRings("frame3_1", data["Sokka"])
        areachart.initVis()
    });
}