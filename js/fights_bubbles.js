
const config = {
    // Map dimensions
    mapWidth: 700,
    mapHeight: 800,
    backgroundColor: '#1e3a5f', 
    nationColors: {
        'Fire': '#FF6B5E',     
        'Water': '#7CB5F5',    
        'Earth': '#B89968',     
        'Air': '#FFFFFF'        
    },
    
    // Bubble size range
    bubbleScale: {
        min: 12,
        max: 28
    }
};

const manualPositions = {
  "1": {
    "x": 331,
    "y": 170
  },
  "2": {
    "x": 407,
    "y": 489
  },
  "3": {
    "x": 672,
    "y": 453
  },
  "4": {
    "x": 513,
    "y": 467
  },
  "5": {
    "x": 420,
    "y": 497
  },
  "6": {
    "x": 384,
    "y": 171
  },
  "7": {
    "x": 456,
    "y": 494
  },
  "8": {
    "x": 216,
    "y": 225
  },
  "9": {
    "x": 416,
    "y": 490
  },
  "10": {
    "x": 422,
    "y": 539
  },
  "11": {
    "x": 426,
    "y": 398
  },
  "12": {
    "x": 538,
    "y": 333
  },
  "13": {
    "x": 684,
    "y": 442
  },
  "14": {
    "x": 423,
    "y": 537
  },
  "15": {
    "x": 165,
    "y": 340
  },
  "16": {
    "x": 115,
    "y": 190
  },
  "17": {
    "x": 158,
    "y": 386
  },
  "18": {
    "x": 139,
    "y": 223
  },
  "19": {
    "x": 137,
    "y": 209
  },
  "20": {
    "x": 203,
    "y": 175
  },
  "21": {
    "x": 85,
    "y": 343
  },
  "22": {
    "x": 95,
    "y": 340
  },
  "23": {
    "x": 221,
    "y": 344
  },
  "24": {
    "x": 151,
    "y": 374
  },
  "25": {
    "x": 200,
    "y": 174
  },
  "26": {
    "x": 140,
    "y": 220
  },
  "27": {
    "x": 219,
    "y": 334
  },
  "28": {
    "x": 222,
    "y": 491
  },
  "29": {
    "x": 163,
    "y": 373
  },
  "30": {
    "x": 222,
    "y": 322
  },
  "31": {
    "x": 165,
    "y": 186
  },
  "32": {
    "x": 232,
    "y": 496
  },
  "33": {
    "x": 136,
    "y": 212
  },
  "34": {
    "x": 217,
    "y": 343
  },
  "35": {
    "x": 238,
    "y": 491
  },
  "36": {
    "x": 216,
    "y": 324
  },
  "37": {
    "x": 237,
    "y": 331
  },
  "38": {
    "x": 224,
    "y": 490
  },
  "39": {
    "x": 139,
    "y": 373
  },
  "40": {
    "x": 136,
    "y": 218
  },
  "41": {
    "x": 331,
    "y": 47
  },
  "42": {
    "x": 417,
    "y": 51
  },
  "43": {
    "x": 377,
    "y": 612
  },
  "44": {
    "x": 394,
    "y": 63
  },
  "45": {
    "x": 325,
    "y": 45
  },
  "46": {
    "x": 407,
    "y": 595
  },
  "47": {
    "x": 385,
    "y": 53
  },
  "48": {
    "x": 336,
    "y": 590
  },
  "49": {
    "x": 388,
    "y": 78
  },
  "50": {
    "x": 332,
    "y": 574
  },
  "51": {
    "x": 345,
    "y": 536
  },
  "52": {
    "x": 381,
    "y": 601
  },
  "53": {
    "x": 338,
    "y": 38
  },
  "54": {
    "x": 424,
    "y": 587
  },
  "55": {
    "x": 398,
    "y": 83
  },
  "56": {
    "x": 390,
    "y": 589
  },
  "57": {
    "x": 429,
    "y": 578
  },
  "58": {
    "x": 414,
    "y": 66
  },
  "59": {
    "x": 370,
    "y": 532
  },
  "60": {
    "x": 331,
    "y": 77
  },
  "61": {
    "x": 370,
    "y": 73
  },
  "62": {
    "x": 334,
    "y": 566
  },
  "63": {
    "x": 373,
    "y": 535
  },
  "64": {
    "x": 356,
    "y": 57
  },
  "65": {
    "x": 349,
    "y": 610
  },
  "66": {
    "x": 431,
    "y": 65
  },
  "67": {
    "x": 404,
    "y": 87
  }
};

// Create separate container for map
const mapContainer = d3.select('#frame3')
    .append('div')
    .attr('id', 'map-container');

// Create SVG for map (minimal padding)
const svg = mapContainer
    .append('svg')
    .attr('width', config.mapWidth + 40)
    .attr('height', config.mapHeight + 60)
    .style('background-color', config.backgroundColor)
    .style('display', 'block');

// Navy blue background
svg.append('rect')
    .attr('width', config.mapWidth + 40)
    .attr('height', config.mapHeight + 60)
    .attr('fill', config.backgroundColor);

// Create a group for the map content
const mapGroup = svg.append('g')
    .attr('class', 'map-content')
    .attr('transform', `translate(20, 30)`);

// Title for the map section
mapGroup.append('text')
    .attr('x', config.mapWidth / 2)
    .attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#ECF0F1')
    .text('Fight Locations by Nation');

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
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('max-width', '340px')
    .style('box-shadow', '0 6px 16px rgba(0,0,0,0.6)')
    .style('line-height', '1.6')
    .style('border', '2px solid rgba(255,255,255,0.3)');

// Helper: get random point in territory
function getRandomPointInTerritory(polygons) {
    const polygon = polygons[Math.floor(Math.random() * polygons.length)];
    const xs = polygon.map(p => p.x);
    const ys = polygon.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    for (let i = 0; i < 100; i++) {
        const point = {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY)
        };
        if (isPointInPolygon(point, polygon)) {
            return point;
        }
    }
    
    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
    };
}

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

// Load data
let nodes = [];
let nationsData = null;
let currentFights = [];

Promise.all([
    d3.json('data/processed/atla-world-map.json'),
    d3.json('data/processed/fights.json')
]).then(([worldMapData, fightsData]) => {
    
    console.log('World map loaded:', worldMapData);
    console.log('Fights loaded:', fightsData.fights.length);
    
    // Store fights globally for network filtering
    currentFights = fightsData.fights;
    window.currentFights = currentFights;
    
    // Calculate scale factor to fit map into smaller dimensions
    const originalWidth = 1300;
    const originalHeight = 1100;
    const scaleX = config.mapWidth / originalWidth;
    const scaleY = config.mapHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    console.log(`Scaling map by ${scale.toFixed(3)}`);
    
    // Scale all polygons
    nationsData = {};
    Object.entries(worldMapData.nations).forEach(([nationName, nationData]) => {
        nationsData[nationName] = {
            ...nationData,
            polygons: nationData.polygons.map(polygon => 
                polygon.map(point => ({
                    x: point.x * scale,
                    y: point.y * scale
                }))
            ),
            centroid: nationData.centroid ? {
                x: nationData.centroid.x * scale,
                y: nationData.centroid.y * scale
            } : null
        };
    });
    
    if (window.characterNetwork && window.characterNetwork.create) {
        console.log('Creating character network...');
        window.characterNetwork.create(fightsData);
    } else {
        console.warn('Character network not loaded. Make sure character-network.js is included before this file.');
    }
    
    // Draw all nation territories
    const territoriesGroup = mapGroup.append('g').attr('class', 'territories');
    
    Object.entries(nationsData).forEach(([nationName, nationData]) => {
        const group = territoriesGroup.append('g')
            .attr('class', `nation-${nationName.toLowerCase()}`);
        
        nationData.polygons.forEach(polygon => {
            const pathData = 'M' + polygon.map(p => `${p.x},${p.y}`).join('L') + 'Z';
            
            // Air temples faded
            const opacity = nationName === 'Air' ? 0.05 : 0.2;
            const strokeOpacity = nationName === 'Air' ? 0.2 : 0.6;
            
            group.append('path')
                .attr('d', pathData)
                .attr('fill', config.nationColors[nationName])
                .attr('opacity', opacity)
                .attr('stroke', config.nationColors[nationName])
                .attr('stroke-width', nationName === 'Air' ? 1 : 2)
                .attr('stroke-dasharray', '6,3')
                .attr('stroke-opacity', strokeOpacity);
        });
    });
    
    // Size scale
    const sizeScale = d3.scaleLinear()
        .domain([1, d3.max(fightsData.fights, d => d.num_participants)])
        .range([config.bubbleScale.min, config.bubbleScale.max]);
    
    // Create nodes for each fight
    nodes = fightsData.fights.map(fight => {
        const nation = fight.book;
        const nationData = nationsData[nation];
        
        // Get position (manual or random default)
        let pos;
        if (manualPositions[fight.id]) {
            pos = manualPositions[fight.id];
        } else if (nationData && nationData.polygons.length > 0) {
            pos = getRandomPointInTerritory(nationData.polygons);
        } else {
            pos = {x: 350, y: 400};
        }
        
        return {
            ...fight,
            radius: sizeScale(fight.num_participants),
            x: pos.x,
            y: pos.y,
            fx: pos.x,
            fy: pos.y,
            color: config.nationColors[nation]
        };
    });
    
    // Create bubbles
    const bubbles = mapGroup.append('g')
        .attr('class', 'bubbles')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'bubble')
        .attr('transform', d => `translate(${d.x},${d.y})`);
        // .call(drag());
    
    // Store global reference for filtering
    window.mapBubbles = bubbles;
    
    bubbles.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
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
                : 'Unknown';
            
            const supporting = d.supporting_characters && d.supporting_characters.length > 0
                ? `<br><span style="font-size: 12px; color: #aaa;">Also: ${d.supporting_characters.slice(0, 3).join(', ')}</span>`
                : '';
            
            tooltip.html(`
                <div style="border-bottom: 2px solid ${d.color}; padding-bottom: 8px; margin-bottom: 8px;">
                    <strong style="font-size: 16px;">${d.chapter}</strong><br>
                    <span style="color: ${d.color}; font-weight: bold;">Book ${d.book_num}: ${d.book}</span><br>
                    <span style="font-size: 11px; color: #666;">Fight #${d.id}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Combatants:</strong><br>
                    <span style="font-size: 15px;">${combatants}</span>
                    ${supporting}
                </div>
                <div style="font-size: 12px; color: #aaa;">
                    Participants: ${d.num_participants}<br>
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
            
            tooltip.style('opacity', 0).style('visibility', 'hidden');
        });
    
    // Add export button
    // mapGroup.append('foreignObject')
    //     .attr('x', config.mapWidth - 155)
    //     .attr('y', -25)
    //     .attr('width', 150)
    //     .attr('height', 100)
    //     .append('xhtml:div')
    //     .html(`
    //         <button onclick="exportPositions()" style="
    //             background: #FF6B5E;
    //             color: white;
    //             border: none;
    //             padding: 8px 12px;
    //             border-radius: 5px;
    //             cursor: pointer;
    //             font-size: 12px;
    //             font-weight: bold;
    //             display: block;
    //             width: 100%;
    //         ">Export Positions</button>
    //         <div style="color: #95A5A6; font-size: 10px; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; margin-top: 4px;">
    //             Drag & Export to save
    //         </div>
    //     `);
    
    // // Stats display
    // const stats = mapGroup.append('g').attr('transform', 'translate(5, 0)');
    
    // ['Water', 'Earth', 'Fire'].forEach((book, i) => {
    //     const count = nodes.filter(n => n.book === book).length;
    //     const color = config.nationColors[book];
        
    //     stats.append('rect')
    //         .attr('x', 0)
    //         .attr('y', i * 28)
    //         .attr('width', 130)
    //         .attr('height', 24)
    //         .attr('fill', color)
    //         .attr('opacity', 0.3)
    //         .attr('rx', 4);
        
    //     stats.append('text')
    //         .attr('x', 8)
    //         .attr('y', i * 28 + 16)
    //         .style('font-size', '12px')
    //         .style('font-weight', 'bold')
    //         .style('fill', color)
    //         .text(`${book}: ${count} fights`);
    // });
    
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
        
    //     navigator.clipboard.writeText(jsonString).then(() => {
    //         alert('✓ Positions copied to clipboard!\n\nPaste into the manualPositions object in the code.');
    //         console.log('Exported positions:', jsonString);
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
    //         d.x = event.x;
    //         d.y = event.y;
    //         d.fx = event.x;
    //         d.fy = event.y;
    //         d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
    //     }
        
    //     function dragended(event, d) {
    //         d3.select(this).select('circle')
    //             .attr('stroke', '#fff')
    //             .attr('stroke-width', 2);
    //         console.log(`Fight ${d.id} (${d.book}) moved to (${Math.round(d.x)}, ${Math.round(d.y)})`);
    //     }
        
    //     return d3.drag()
    //         .on('start', dragstarted)
    //         .on('drag', dragged)
    //         .on('end', dragended);
    // }
    
}).catch(error => {
    console.error('Error loading data:', error);
    svg.append('text')
        .attr('x', config.mapWidth / 2)
        .attr('y', config.mapHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#E74C3C')
        .text('Error: ' + error.message);
});