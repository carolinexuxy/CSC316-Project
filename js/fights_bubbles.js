// Avatar Fights Bubble Chart - Manual Positioning
// Bubbles manually placed to form Fire Nation shape

// Configuration
const config = {
    width: 1400,
    height: 900,
    // backgroundColor: '#1a1a2e',
    fireColor: '#E94D40',
    waterColor: '#4DA6FF',
    bubbleScale: {
        min: 15,
        max: 45
    }
};

// MANUAL POSITIONS - Edit these coordinates to position bubbles
// Format: { fightId: {x: xPosition, y: yPosition} }
const firePositions = {
  "15": { x: 491, y: 500 },
  "16": { x: 643, y: 372 },
  "17": { x: 660, y: 488 },
  "18": { x: 873, y: 432 },
  "19": { x: 579, y: 357 },
  "20": { x: 488, y: 450 },
  "21": { x: 584, y: 577 },
  "22": { x: 684, y: 514 },
  "23": { x: 553, y: 505 },
  "24": { x: 615, y: 520 },
  "25": { x: 705, y: 462 },
  "26": { x: 798, y: 453 },
  "27": { x: 450, y: 394 },
  "28": { x: 431, y: 474 },
  "29": { x: 381, y: 459 },
  "30": { x: 632, y: 598 },
  "31": { x: 654, y: 569 },
  "32": { x: 601, y: 474 },
  "33": { x: 615, y: 385 },
  "34": { x: 534, y: 340 },
  "35": { x: 920, y: 339 },
  "36": { x: 903, y: 382 },
  "37": { x: 423, y: 322 },
  "38": { x: 376, y: 399 },
  "39": { x: 396, y: 429 },
  "40": { x: 491, y: 313 }
};

// Manual positions for Water Nation
const waterPositions = {
    // example:
    // "5": { x: 1050, y: 300 },
};



// Create SVG
const svg = d3.select('#frame3')
    .append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    .style('background-color', config.backgroundColor);

svg.append('rect')
    .attr('width', config.width)
    .attr('height', config.height)
    .attr('fill', config.backgroundColor);

// Add title
svg.append('text')
    .attr('x', config.width / 2)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .style('font-size', '28px')
    .style('font-weight', 'bold')
    .style('fill', '#ECF0F1')
    .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.5)')
    .text('Avatar Last Airbender Fights');

// Tooltip
const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('opacity', 0)
    .style('background-color', 'rgba(0, 0, 0, 0.95)')
    .style('color', 'white')
    .style('padding', '14px 18px')
    .style('border-radius', '10px')
    .style('font-size', '14px')
    .style('font-family', 'Arial, sans-serif')
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('max-width', '340px')
    .style('box-shadow', '0 6px 16px rgba(0,0,0,0.6)')
    .style('line-height', '1.6')
    .style('border', '2px solid rgba(255,255,255,0.3)');

// Helper functions
function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function isPointInTerritory(point, polygons) {
    return polygons.some(polygon => isPointInPolygon(point, polygon));
}

// Generate good default positions based on Fire Nation shape
function generateDefaultPositions(fights, polygons, sizeScale) {
    const positions = {};
    
    // Sort fights by size (largest first)
    const sortedFights = [...fights].sort((a, b) => b.num_participants - a.num_participants);
    
    // Main island approximate positions (hand-picked good spots)
    const mainIslandPositions = [
        // Center area (for largest bubbles)
        {x: 500, y: 380}, {x: 550, y: 400}, {x: 600, y: 380}, {x: 650, y: 400},
        {x: 520, y: 430}, {x: 580, y: 450}, {x: 630, y: 430}, {x: 680, y: 450},
        // Upper area
        {x: 480, y: 320}, {x: 540, y: 300}, {x: 600, y: 310}, {x: 660, y: 330},
        // Lower area  
        {x: 500, y: 500}, {x: 560, y: 520}, {x: 620, y: 500}, {x: 680, y: 520},
        // Edges
        {x: 450, y: 360}, {x: 720, y: 380}, {x: 480, y: 480}, {x: 700, y: 460}
    ];
    
    // Smaller island positions
    const smallIslandPositions = [
        {x: 750, y: 300}, {x: 800, y: 320}, // Top right islands
        {x: 850, y: 340}, {x: 900, y: 360}, // Far right islands
        {x: 420, y: 300}, {x: 400, y: 350}  // Left side islands
    ];
    
    // Assign positions
    let mainIdx = 0;
    let smallIdx = 0;
    
    sortedFights.forEach((fight, idx) => {
        const radius = sizeScale(fight.num_participants);
        let position;
        
        // Larger bubbles get main island positions
        if (radius > 25 && mainIdx < mainIslandPositions.length) {
            position = mainIslandPositions[mainIdx];
            mainIdx++;
        } else if (mainIdx < mainIslandPositions.length) {
            position = mainIslandPositions[mainIdx];
            mainIdx++;
        } else if (smallIdx < smallIslandPositions.length) {
            position = smallIslandPositions[smallIdx];
            smallIdx++;
        } else {
            // Fallback random position
            position = {x: 500 + Math.random() * 200, y: 350 + Math.random() * 150};
        }
        
        positions[fight.id] = position;
    });
    
    return positions;
}

// Load data
Promise.all([
    d3.json('data/processed/fire-nation-data.json'),
    d3.json('data/processed/water-nation-data.json'),
    d3.json('data/processed/fights.json')
]).then(([fireNationData, waterNationData, fightData]) => {

    const fireNationTerritory = {
        polygons: fireNationData.polygons,
        centroid: fireNationData.centroid
    };

    const waterNationTerritory = {
        polygons: waterNationData.polygons,
        centroid: waterNationData.centroid
    };
    
    // Draw Fire Nation territory
    const territoriesGroup = svg.append('g').attr('class', 'fire-territory');
    
    fireNationTerritory.polygons.forEach((polygon) => {
        const pathData = 'M' + polygon.map(p => `${p.x},${p.y}`).join('L') + 'Z';
        
        territoriesGroup.append('path')
            .attr('d', pathData)
            .attr('fill', config.fireColor)
            .attr('opacity', 0.27)
            .attr('stroke', config.fireColor)
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', '6,3')
            .attr('stroke-opacity', 0.6);
    });

    // Draw Water Nation territory
    // Draw Water Nation territory
    const waterTerritoriesGroup = svg.append('g').attr('class', 'water-territory');

    waterNationTerritory.polygons.forEach((polygon) => {
        const pathData = 'M' + polygon.map(p => `${p.x},${p.y}`).join('L') + 'Z';

        waterTerritoriesGroup.append('path')
            .attr('d', pathData)
            .attr('fill', config.waterColor)
            .attr('opacity', 0.27)
            .attr('stroke', config.waterColor)
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', '6,3')
            .attr('stroke-opacity', 0.6);
    });

    
    svg.append('text')
        .attr('x', fireNationTerritory.centroid.x)
        .attr('y', config.height - 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', config.fireColor)
        .style('text-shadow', '2px 2px 6px rgba(0,0,0,0.8)');
    
    // Filter Fire Nation fights
    const fireNationFights = fightData.fights.filter(f => f.book === 'Fire');
    
    // Size scale
    const sizeScale = d3.scaleLinear()
        .domain([1, d3.max(fireNationFights, d => d.num_participants)])
        .range([config.bubbleScale.min, config.bubbleScale.max]);
    
    // Use manual positions if provided, otherwise generate defaults
    const positions = Object.keys(firePositions).length > 0 
        ? firePositions 
        : generateDefaultPositions(fireNationFights, fireNationTerritory.polygons, sizeScale);
    
    console.log('Using positions:', positions);
    
    // Create nodes with manual positions
    const nodes = fireNationFights.map(fight => {
        const pos = positions[fight.id] || {x: 500, y: 400};
        return {
            ...fight,
            radius: sizeScale(fight.num_participants),
            x: pos.x,
            y: pos.y,
            fx: pos.x,  // Fixed position
            fy: pos.y   // Fixed position
        };
    });
    
    // Create bubbles (no force simulation - fixed positions)
    const bubbles = svg.append('g')
        .attr('class', 'bubbles')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'bubble')
        .attr('transform', d => `translate(${d.x},${d.y})`);
        //.call(drag());
    
    bubbles.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', config.fireColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.85)
        .style('cursor', 'move')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 4)
                .attr('stroke', '#FFD700');
            
            const combatants = d.main_combatants && d.main_combatants.length > 0 
                ? d.main_combatants.join(', ')
                : 'Unknown fighters';
            
            const supporting = d.supporting_characters && d.supporting_characters.length > 0
                ? `<br><span style="font-size: 12px; color: #aaa;">Also involved: ${d.supporting_characters.slice(0, 3).join(', ')}</span>`
                : '';
            
            tooltip.html(`
                <div style="border-bottom: 2px solid ${config.fireColor}; padding-bottom: 8px; margin-bottom: 8px;">
                    <strong style="font-size: 16px;">${d.chapter}</strong><br>
                    <span style="color: ${config.fireColor}; font-weight: bold;">Book ${d.book_num}: Fire</span><br>
                    <span style="font-size: 11px; color: #666;">Fight ID: ${d.id}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Main Combatants:</strong><br>
                    <span style="font-size: 15px;">${combatants}</span>
                    ${supporting}
                </div>
                <div style="font-size: 12px; color: #aaa; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">
                    Total participants: ${d.num_participants}<br>
                    Position: (${Math.round(d.x)}, ${Math.round(d.y)})
                </div>
            `)
                .style('visibility', 'visible')
                .style('opacity', 1);
        })
        .on('mousemove', function(event) {
            tooltip
                .style('top', (event.pageY + 15) + 'px')
                .style('left', (event.pageX + 15) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('opacity', 0.85)
                .attr('stroke-width', 2)
                .attr('stroke', '#fff');
            
            tooltip.style('opacity', 0)
                .style('visibility', 'hidden');
        });
    
    // Add button to export positions
    // svg.append('foreignObject')
    //     .attr('x', 20)
    //     .attr('y', 60)
    //     .attr('width', 200)
    //     .attr('height', 100)
    //     .append('xhtml:div')
    //     .html(`
    //         <button onclick="exportPositions()" style="
    //             background: #E94D40;
    //             color: white;
    //             border: none;
    //             padding: 10px 15px;
    //             border-radius: 5px;
    //             cursor: pointer;
    //             font-size: 14px;
    //             font-weight: bold;
    //         ">Export Positions</button>
    //         <div style="color: #95A5A6; font-size: 11px; margin-top: 5px;">
    //             Drag bubbles to reposition.<br>Click to copy positions.
    //         </div>
    //     `);
    
    // // Export function
    // window.exportPositions = function() {
    //     const exportData = {};
    //     nodes.forEach(node => {
    //         exportData[node.id] = {
    //             x: Math.round(node.x),
    //             y: Math.round(node.y)
    //         };
    //     });
        
    //     const jsonString = JSON.stringify(exportData, null, 2);
        
    //     // Copy to clipboard
    //     navigator.clipboard.writeText(jsonString).then(() => {
    //         alert('Positions copied to clipboard!\n\nPaste these into the firePositions object in the code.');
    //         console.log('Manual positions:', jsonString);
    //     });
    // };
    
    // function drag() {
    //     function dragstarted(event, d) {
    //         d3.select(this).raise();
    //         d3.select(this).select('circle')
    //             .attr('stroke', '#FFD700')
    //             .attr('stroke-width', 3);
    //     }
        
    //     function dragged(event, d) {
    //         // Update position
    //         d.x = event.x;
    //         d.y = event.y;
    //         d.fx = event.x;
    //         d.fy = event.y;
            
    //         // Move the bubble
    //         d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
    //     }
        
    //     function dragended(event, d) {
    //         d3.select(this).select('circle')
    //             .attr('stroke', '#fff')
    //             .attr('stroke-width', 2);
            
    //         console.log(`Fight ${d.id} moved to (${Math.round(d.x)}, ${Math.round(d.y)})`);
    //     }
        
    //     return d3.drag()
    //         .on('start', dragstarted)
    //         .on('drag', dragged)
    //         .on('end', dragended);
    // }
    
    // console.log('✓ Manual positioning mode active - drag bubbles to reposition!');
    
}).catch(error => {
    console.error('Error loading data:', error);
    svg.append('text')
        .attr('x', config.width / 2)
        .attr('y', config.height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#E74C3C')
        .text('Error: ' + error.message);
});