const config = {
    // Map dimensions
    mapWidth: 600,
    mapHeight: 600,
    backgroundColor: '#e8d9b5',   
    nationColors: {
        'Fire': '#b84e10',         
        'Water': '#235e8c',        
        'Earth': '#4a6a22',        
        'Air': '#685949'           
    },

    // Bubble size range
    bubbleScale: {
        min: 12,
        max: 28
    }
};

const manualPositions = {
  "1": { "x": 317, "y": 42 },
  "2": { "x": 301, "y": 470 },
  "3": { "x": 282, "y": 491 },
  "4": { "x": 304, "y": 513 },
  "5": { "x": 368, "y": 496 },
  "6": { "x": 351, "y": 51 },
  "7": { "x": 309, "y": 488 },
  "8": { "x": 348, "y": 62 },
  "9": { "x": 282, "y": 471 },
  "10": { "x": 348, "y": 504 },
  "11": { "x": 249, "y": 494 },
  "12": { "x": 329, "y": 510 },
  "13": { "x": 262, "y": 499 },
  "14": { "x": 330, "y": 504 },
  "15": { "x": 290, "y": 67 },
  "16": { "x": 266, "y": 66 },
  "17": { "x": 321, "y": 474 },
  "18": { "x": 287, "y": 47 },
  "19": { "x": 334, "y": 48 },
  "20": { "x": 305, "y": 39 },
  "21": { "x": 373, "y": 488 },
  "22": { "x": 317, "y": 53 },
  "23": { "x": 499, "y": 254 },
  "24": { "x": 376, "y": 294 },
  "25": { "x": 382, "y": 334 },
  "26": { "x": 413, "y": 305 },
  "27": { "x": 480, "y": 304 },
  "28": { "x": 401, "y": 228 },
  "29": { "x": 470, "y": 186 },
  "30": { "x": 364, "y": 150 },
  "31": { "x": 407, "y": 269 },
  "32": { "x": 405, "y": 132 },
  "33": { "x": 525, "y": 190 },
  "34": { "x": 440, "y": 318 },
  "35": { "x": 316, "y": 263 },
  "36": { "x": 430, "y": 166 },
  "37": { "x": 455, "y": 259 },
  "38": { "x": 369, "y": 231 },
  "39": { "x": 339, "y": 243 },
  "40": { "x": 453, "y": 128 },
  "41": { "x": 500, "y": 154 },
  "42": { "x": 55, "y": 291 },
  "43": { "x": 128, "y": 299 },
  "44": { "x": 92, "y": 173 },
  "45": { "x": 105, "y": 311 },
  "46": { "x": 62, "y": 254 },
  "47": { "x": 121, "y": 153 },
  "48": { "x": 113, "y": 180 },
  "49": { "x": 121, "y": 265 },
  "50": { "x": 102, "y": 157 },
  "51": { "x": 161, "y": 287 },
  "52": { "x": 81, "y": 252 },
  "53": { "x": 87, "y": 300 },
  "54": { "x": 50, "y": 276 },
  "55": { "x": 131, "y": 319 },
  "56": { "x": 74, "y": 281 },
  "57": { "x": 193, "y": 284 },
  "58": { "x": 107, "y": 162 },
  "59": { "x": 51, "y": 255 },
  "60": { "x": 166, "y": 146 },
  "61": { "x": 39, "y": 269 },
  "62": { "x": 83, "y": 171 },
  "63": { "x": 102, "y": 259 },
  "64": { "x": 142, "y": 147 }
};

// Intro text
const introBlock = d3.select('#frame3')
    .append('div')
    .attr('class', 'frame3-intro')
    .style('max-width', '1200px')
    .style('margin', '0 auto 22px auto')
    .style('padding', '0 20px')
    .style('text-align', 'center')
    .style('color', '#2c1f0e');

introBlock.append('h2')
    .style('margin', '0 0 10px 0')
    .attr("font-family", "Philosopher, serif")
    .attr("fill", "#5a3e22")
    .style('font-weight', 'normal')
    .style('letter-spacing', '0.05em')
    .text('Conflict Across The Show');

introBlock.append('p')
    .style('margin', '0 auto')
    .style('max-width', '900px')
    .style('font-family', "'Philosopher', serif")
    .style('font-size', '16px')
    .style('line-height', '1.7')
    .style('color', 'var(--ink-faded)')
    .text(`While elemental bending is one
        of the most recognizable    
        aspects of Avatar: The Last
        Airbender, it also reflects
        deeper tensions between
        characters and nations. The
        previous visualization showed
        how often the elements are
        referenced throughout the
        series, highlighting how
        bending shapes the world of
        the show. However, references
        to elements alone do not
        capture the conflicts that
        drive the story forward. The
        visualization on the left
        shows how fights occur in each
        book (season), illustrating
        how conflict develops across
        the series. These fights mark
        important narrative moments
        where personal rivalries and
        political tensions escalate.
        The character network on the
        right shifts the focus from
        when fights happen to who they
        happen between, revealing how
        conflict is distributed across
        recurring rivalries and
        relationships.`);

introBlock.append('p')
    .style('margin', '14px auto 0 auto')
    .style('max-width', '900px')
    .style('font-family', "'Philosopher', serif")
    .style('font-size', '15px')
    .style('line-height', '1.6')
    .style('color', 'var(--ink-faded)')
    .style('font-weight', 'bold')
    .text(`This visualization lets you explore where fights happen
        and which characters are involved by hovering over fight
        bubbles on the map for details. Click characters in the
        network graph to filter and see only the fights they
        participate in.`);

const vizRow = d3.select('#frame3')
    .append('div')
    .attr('class', 'frame3-viz-row');

// Create separate container for map
const mapContainer = vizRow
    .append('div')
    .attr('id', 'map-container')
    .style('overflow', 'hidden');

// Create SVG for map
const svg = mapContainer
    .append('svg')
    .attr('width', config.mapWidth + 40)
    .attr('height', config.mapHeight + 60)
    .attr('viewBox', `0 0 ${config.mapWidth + 40} ${config.mapHeight + 60}`)
    .style('background-color', config.backgroundColor)
    .style('display', 'block');

// Background rect
svg.append('rect')
    .attr('width', config.mapWidth + 40)
    .attr('height', config.mapHeight + 60)
    .attr('fill', config.backgroundColor);

// Border around map 
svg.append('rect')
    .attr('x', 8)
    .attr('y', 8)
    .attr('width', config.mapWidth + 24)
    .attr('height', config.mapHeight + 44)
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('fill', 'none')
    .attr('stroke', '#5a3e22')
    .attr('stroke-width', 2)
    .attr('opacity', 0.7)
    .style('pointer-events', 'none');

// Clip path so zoomed content doesn't bleed outside the border
svg.append('defs').append('clipPath')
    .attr('id', 'map-clip')
    .append('rect')
    .attr('x', 9)
    .attr('y', 9)
    .attr('width', config.mapWidth + 22)
    .attr('height', config.mapHeight + 42)
    .attr('rx', 10);

// Create a group for the map content
const mapGroup = svg.append('g')
    .attr('class', 'map-content')
    .attr('clip-path', 'url(#map-clip)')
    .attr('transform', `translate(-2, 30)`);

// Title 
svg.append('text')
    .attr('x', config.mapWidth / 2 + 20)
    .attr('y', 26)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('font-family', "'Uncial Antiqua', cursive")
    .style('fill', '#2c1f0e')
    .style('letter-spacing', '0.06em')
    .style('pointer-events', 'none')
    .text('Fights By Season');

svg.append('line')
    .attr('x1', config.mapWidth / 2 - 80)
    .attr('x2', config.mapWidth / 2 + 140)
    .attr('y1', 31).attr('y2', 31)
    .attr('stroke', 'rgba(44,31,14,0.2)')
    .attr('stroke-width', 1)
    .style('pointer-events', 'none');


// bubbles scale inversely with zoom so they stay a constant screen
// size as the map expands
const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .translateExtent([[0, 0], [config.mapWidth + 40, config.mapHeight + 60]])
    .on('zoom', (event) => {
        const t = event.transform;

        // Move + scale the map territory
        mapGroup.attr('transform',
            `translate(${t.x - 2}, ${t.y + 30}) scale(${t.k})`
        );

        mapGroup.selectAll('.bubble circle')
            .attr('r', d => d.radius / t.k)
            .attr('stroke-width', 1.5 / t.k);
    });

svg.call(zoom);

// Only zoom on pinch or ctrl+scroll 
svg.on('wheel.zoom', function(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoom.filter(() => true).apply(this, arguments);
}, { passive: false });

// Tooltip 
const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('opacity', 0)
    .style('background-color', '#f0e6cc')
    .style('color', '#2c1f0e')
    .style('padding', '12px 16px')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('font-family', "'Philosopher', serif")
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('max-width', '300px')
    .style('box-shadow', '2px 4px 14px rgba(44,31,14,0.25)')
    .style('line-height', '1.6')
    .style('border', '1px solid rgba(44,31,14,0.2)');

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
        if (isPointInPolygon(point, polygon)) return point;
    }
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
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

let nodes = [];
let nationsData = null;
let currentFights = [];

Promise.all([
    d3.json('data/processed/atla-world-map.json'),
    d3.json('data/processed/fights.json')
]).then(([worldMapData, fightsData]) => {

    console.log('World map loaded:', worldMapData);
    console.log('Fights loaded:', fightsData.fights.length);

    currentFights = fightsData.fights;
    window.currentFights = currentFights;

    const originalWidth = 1300;
    const originalHeight = 1100;
    const scaleX = config.mapWidth / originalWidth;
    const scaleY = config.mapHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);

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
        window.characterNetwork.create(fightsData);
    } else {
        console.warn('Character network not loaded.');
    }

    // Draw nation territories
    const territoriesGroup = mapGroup.append('g').attr('class', 'territories');

    Object.entries(nationsData).forEach(([nationName, nationData]) => {
        const group = territoriesGroup.append('g')
            .attr('class', `nation-${nationName.toLowerCase()}`);

        nationData.polygons.forEach(polygon => {
            const pathData = 'M' + polygon.map(p => `${p.x},${p.y}`).join('L') + 'Z';
            const opacity = nationName === 'Air' ? 0.04 : 0.18;
            const strokeOpacity = nationName === 'Air' ? 0.15 : 0.55;

            group.append('path')
                .attr('d', pathData)
                .attr('fill', config.nationColors[nationName])
                .attr('opacity', opacity)
                .attr('stroke', config.nationColors[nationName])
                .attr('stroke-width', nationName === 'Air' ? 0.8 : 1.5)
                .attr('stroke-dasharray', '5,4')
                .attr('stroke-opacity', strokeOpacity);
        });
    });

    // Size scale
    const sizeScale = d3.scaleLinear()
        .domain([1, d3.max(fightsData.fights, d => d.num_participants)])
        .range([config.bubbleScale.min, config.bubbleScale.max]);

    // Create nodes
    nodes = fightsData.fights.map(fight => {
        const nation = fight.book;
        const nationData = nationsData[nation];

        let pos;
        if (manualPositions[fight.id]) {
            pos = manualPositions[fight.id];
        } else if (nationData && nationData.polygons.length > 0) {
            pos = getRandomPointInTerritory(nationData.polygons);
        } else {
            pos = { x: 350, y: 400 };
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

    window.mapBubbles = bubbles;

    bubbles.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .attr('stroke', '#e8d9b5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.82)
        .style('filter', 'drop-shadow(0 1px 3px rgba(44,31,14,0.3))')
        .on('mouseover', function(event, d) {
            const selected = Array.from(selectedCharacters);
            const hasActiveFilter = selected.length > 0;
            const isMatch = !hasActiveFilter || (
                d.all_characters &&
                d.all_characters.some(c => selected.includes(c))
            );

            if (!isMatch) return;

            // Read current zoom so hover stroke scales correctly too
            const k = d3.zoomTransform(svg.node()).k;

            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 3 / k)
                .attr('stroke', '#2c1f0e');

            const combatants = d.main_combatants && d.main_combatants.length > 0
                ? d.main_combatants.join(', ')
                : 'Unknown';

            const supporting = d.supporting_characters && d.supporting_characters.length > 0
                ? `<div style="font-size:11px;color:#5a3e22;margin-top:4px;">Also: ${d.supporting_characters.slice(0, 3).join(', ')}</div>`
                : '';

            tooltip.html(`
                <div style="border-bottom:1px solid rgba(44,31,14,0.2);padding-bottom:7px;margin-bottom:7px;">
                    <strong style="font-family:'Uncial Antiqua',cursive;font-size:13px;color:#2c1f0e;">${d.chapter}</strong><br>
                    <span style="color:${d.color};font-weight:bold;font-size:12px;">Book ${d.book_num}: ${d.book}</span>
                    <span style="font-size:10px;color:#5a3e22;margin-left:6px;">Fight #${d.id}</span>
                </div>
                <div style="margin-bottom:6px;">
                    <span style="font-size:11px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Combatants</span><br>
                    <span style="font-size:13px;color:#2c1f0e;">${combatants}</span>
                    ${supporting}
                </div>
                <div style="font-size:11px;color:#5a3e22;font-style:italic;">
                    ${d.num_participants} participant${d.num_participants !== 1 ? 's' : ''}
                </div>
            `)
            .style('visibility', 'visible')
            .style('opacity', 1);
        })
        .on('mousemove', function(event, d) {
            const selected = Array.from(selectedCharacters);
            const hasActiveFilter = selected.length > 0;
            const isMatch = !hasActiveFilter || (
                d.all_characters &&
                d.all_characters.some(c => selected.includes(c))
            );

            if (!isMatch) return;

            tooltip
                .style('top', (event.pageY + 15) + 'px')
                .style('left', (event.pageX + 15) + 'px');
        })
        .on('mouseout', function(event, d) {
            const selected = Array.from(selectedCharacters);
            const hasActiveFilter = selected.length > 0;
            const isMatch = !hasActiveFilter || (
                d.all_characters &&
                d.all_characters.some(c => selected.includes(c))
            );

            const k = d3.zoomTransform(svg.node()).k;

            d3.select(this)
                .attr('opacity', hasActiveFilter ? (isMatch ? 1 : 0.1) : 0.82)
                .attr('stroke-width', (hasActiveFilter ? (isMatch ? 2.5 : 0.8) : 1.5) / k)
                .attr('stroke', '#e8d9b5');

            tooltip.style('opacity', 0).style('visibility', 'hidden');
        });

    // zoom controls for the map
    const btnDefs = [
        { label: '+', dy: 0,  action: () => svg.transition().duration(300).call(zoom.scaleBy, 1.5) },
        { label: '−', dy: 28, action: () => svg.transition().duration(300).call(zoom.scaleBy, 0.67) },
        { label: '⌂', dy: 56, action: () => svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity) },
    ];

    const zoomControls = svg.append('g')
        .attr('class', 'zoom-controls')
        .attr('transform', `translate(${config.mapWidth - 4}, 46)`);

    btnDefs.forEach(btn => {
        const g = zoomControls.append('g')
            .style('cursor', 'pointer')
            .on('click', btn.action);

        g.append('rect')
            .attr('y', btn.dy)
            .attr('width', 22)
            .attr('height', 22)
            .attr('rx', 3)
            .attr('fill', '#f0e6cc')
            .attr('stroke', 'rgba(44,31,14,0.4)')
            .attr('stroke-width', 1)
            .on('mouseover', function() { d3.select(this).attr('fill', '#ddd0b0'); })
            .on('mouseout',  function() { d3.select(this).attr('fill', '#f0e6cc'); });

        g.append('text')
            .attr('x', 11)
            .attr('y', btn.dy + 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-family', "'Philosopher', serif")
            .style('fill', '#2c1f0e')
            .style('pointer-events', 'none')
            .text(btn.label);
    });


}).catch(error => {
    console.error('Error loading data:', error);
    svg.append('text')
        .attr('x', config.mapWidth / 2)
        .attr('y', config.mapHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-family', "'Philosopher', serif")
        .style('fill', '#b84e10')
        .text('Error: ' + error.message);
});