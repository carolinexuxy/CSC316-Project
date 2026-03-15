const networkConfig = {
    width: 650,
    height: 800,
    backgroundColor: '#ffffff', 
    
    nodeColors: {
        'Water': '#7CB5F5',
        'Earth': '#B89968',
        'Fire': '#FF6B5E',
        'default': '#95A5A6'
    },
    
    minFightsThreshold: 2,
    minConnectionStrength: 1
};

let selectedCharacters = new Set();
let networkNodes = [];
let networkLinks = [];
let simulation;
let nodeElements;  
let linkElements;  

function createCharacterNetwork(fightsData) {
    
    // Create separate container for network
    const networkContainer = d3.select('#frame3')
        .append('div')
        .attr('id', 'network-container');
    
    // Create SVG for network (size matches content)
    const networkSvg = networkContainer
        .append('svg')
        .attr('width', networkConfig.width)
        .attr('height', networkConfig.height)
        .style('background-color', networkConfig.backgroundColor)
        .style('display', 'block');  // Remove any default spacing
    
    // Title
    networkSvg.append('text')
        .attr('x', networkConfig.width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#2C3E50')
        .text('Character Fight Network');
    
    // Process fight data to build network
    const characterStats = new Map(); // character -> {fights: count, books: Set, connections: Map}
    const connectionMatrix = new Map(); // "char1-char2" -> count
    
    fightsData.fights.forEach(fight => {
        const characters = fight.all_characters || [];
        
        // Count each character's appearances
        characters.forEach(char => {
            if (!characterStats.has(char)) {
                characterStats.set(char, {
                    name: char,
                    fights: 0,
                    books: new Set(),
                    connections: new Map()
                });
            }
            const stats = characterStats.get(char);
            stats.fights++;
            stats.books.add(fight.book);
        });
        
        // Build connections between characters in the same fight
        for (let i = 0; i < characters.length; i++) {
            for (let j = i + 1; j < characters.length; j++) {
                const char1 = characters[i];
                const char2 = characters[j];
                const key = [char1, char2].sort().join('-');
                
                connectionMatrix.set(key, (connectionMatrix.get(key) || 0) + 1);
                
                // Update character connection counts
                const stats1 = characterStats.get(char1);
                const stats2 = characterStats.get(char2);
                stats1.connections.set(char2, (stats1.connections.get(char2) || 0) + 1);
                stats2.connections.set(char1, (stats2.connections.get(char1) || 0) + 1);
            }
        }
    });
    
    console.log(`Total unique characters: ${characterStats.size}`);
    
    // Filter to significant characters
    const significantCharacters = Array.from(characterStats.values())
        .filter(char => char.fights >= networkConfig.minFightsThreshold)
        .sort((a, b) => b.fights - a.fights);
    
    console.log(`Significant characters (${networkConfig.minFightsThreshold}+ fights): ${significantCharacters.length}`);
    
    // Determine primary book for each character (for coloring)
    significantCharacters.forEach(char => {
        const bookCounts = {Water: 0, Earth: 0, Fire: 0};
        
        // Count fights per book
        fightsData.fights.forEach(fight => {
            if (fight.all_characters && fight.all_characters.includes(char.name)) {
                bookCounts[fight.book]++;
            }
        });
        
        // Assign primary book
        const primaryBook = Object.keys(bookCounts).reduce((a, b) => 
            bookCounts[a] > bookCounts[b] ? a : b
        );
        char.primaryBook = primaryBook;
    });
    
    // Create nodes
    const nodeSizeScale = d3.scaleSqrt()
        .domain([networkConfig.minFightsThreshold, d3.max(significantCharacters, d => d.fights)])
        .range([8, 25]);
    
    networkNodes = significantCharacters.map((char, i) => ({
        id: char.name,
        name: char.name,
        fights: char.fights,
        books: Array.from(char.books),
        primaryBook: char.primaryBook,
        radius: nodeSizeScale(char.fights),
        color: networkConfig.nodeColors[char.primaryBook] || networkConfig.nodeColors.default,
        x: Math.random() * networkConfig.width,
        y: Math.random() * networkConfig.height
    }));
    
    // Create links between significant characters
    const significantCharNames = new Set(significantCharacters.map(c => c.name));
    networkLinks = [];
    
    connectionMatrix.forEach((count, key) => {
        const [char1, char2] = key.split('-');
        if (significantCharNames.has(char1) && significantCharNames.has(char2)) {
            if (count >= networkConfig.minConnectionStrength) {
                networkLinks.push({
                    source: char1,
                    target: char2,
                    strength: count
                });
            }
        }
    });
    
    console.log(`Network links: ${networkLinks.length}`);
    
    // Link width scale
    const linkWidthScale = d3.scaleLinear()
        .domain([1, d3.max(networkLinks, d => d.strength)])
        .range([1, 8]);
    
    // Create force simulation
    simulation = d3.forceSimulation(networkNodes)
        .force('link', d3.forceLink(networkLinks)
            .id(d => d.id)
            .distance(d => 100 - linkWidthScale(d.strength) * 5)
            .strength(d => linkWidthScale(d.strength) / 10)
        )
        .force('charge', d3.forceManyBody()
            .strength(-200)
            .distanceMax(300)
        )
        .force('center', d3.forceCenter(networkConfig.width / 2, networkConfig.height / 2 + 20))
        .force('collision', d3.forceCollide().radius(d => d.radius + 5))
        .force('x', d3.forceX(networkConfig.width / 2).strength(0.05))
        .force('y', d3.forceY(networkConfig.height / 2 + 20).strength(0.05));
    
    // Create link elements
    linkElements = networkSvg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(networkLinks)
        .join('line')
        .attr('stroke', '#95A5A6')
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', d => linkWidthScale(d.strength));
    
    // Create node group
    nodeElements = networkSvg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(networkNodes)
        .join('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded)
        );
    
    // Node circles
    nodeElements.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            // Only show hover effects if not filtering
            if (selectedCharacters.size === 0) {
                // Highlight node
                d3.select(this)
                    .attr('stroke', '#FFD700')
                    .attr('stroke-width', 3);
                
                // Show connected links
                linkElements
                    .attr('stroke-opacity', l => 
                        (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1
                    )
                    .attr('stroke', l =>
                        (l.source.id === d.id || l.target.id === d.id) ? '#FFD700' : '#95A5A6'
                    );
                
                // Highlight connected nodes
                nodeElements.selectAll('circle')
                    .attr('opacity', n => {
                        if (n.id === d.id) return 1;
                        const isConnected = networkLinks.some(l => 
                            (l.source.id === d.id && l.target.id === n.id) ||
                            (l.target.id === d.id && l.source.id === n.id)
                        );
                        return isConnected ? 1 : 0.3;
                    });
            }
            
            // Show tooltip
            showTooltip(event, d);
        })
        .on('mouseout', function() {
            // Only reset hover if not filtering
            if (selectedCharacters.size === 0) {
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
                
                linkElements
                    .attr('stroke-opacity', 0.3)
                    .attr('stroke', '#95A5A6');
                
                nodeElements.selectAll('circle')
                    .attr('opacity', 1);
            }
            
            hideTooltip();
        })
        .on('click', function(event, d) {
            toggleCharacterFilter(d);
            event.stopPropagation();
        });
    
    // Labels for major characters (top 10)
    const topCharacters = networkNodes.slice(0, 10);
    nodeElements.filter(d => topCharacters.includes(d))
        .append('text')
        .attr('dy', d => d.radius + 12)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#2C3E50')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('text-shadow', '0 0 3px #fff, 0 0 3px #fff, 0 0 5px #fff')
        .text(d => d.name);
    
    // Update positions on tick
    simulation.on('tick', () => {
        linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Add legend
    const legend = networkSvg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(10, ${networkConfig.height - 120})`);
    
    legend.append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', 150)
        .attr('height', 115)
        .attr('fill', 'rgba(255,255,255,0.95)')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('rx', 5);
    
    legend.append('text')
        .attr('x', 0)
        .attr('y', 10)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#2C3E50')
        .text('Node Color = Primary Book');
    
    ['Water', 'Earth', 'Fire'].forEach((book, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${30 + i * 25})`);
        
        g.append('circle')
            .attr('r', 6)
            .attr('fill', networkConfig.nodeColors[book]);
        
        g.append('text')
            .attr('x', 15)
            .attr('y', 4)
            .style('font-size', '11px')
            .style('fill', '#2C3E50')
            .text(`Book ${i + 1}: ${book}`);
    });
    
    // Add Reset Filter button
    const resetButton = networkSvg.append('g')
        .attr('class', 'reset-button')
        .attr('transform', `translate(${networkConfig.width - 120}, 20)`)
        .style('cursor', 'pointer')
        .on('click', resetFilters);
    
    resetButton.append('rect')
        .attr('width', 110)
        .attr('height', 35)
        .attr('fill', '#E74C3C')
        .attr('rx', 5)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
    
    resetButton.append('text')
        .attr('x', 55)
        .attr('y', 22)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text('Reset Filter');
    
    // Drag functions
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    return {
        nodes: networkNodes,
        links: networkLinks,
        simulation: simulation
    };
}

// Tooltip for network
const networkTooltip = d3.select('body')
    .append('div')
    .attr('class', 'network-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('opacity', 0)
    .style('background-color', 'rgba(0, 0, 0, 0.95)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '8px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '10001')
    .style('max-width', '280px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.6)')
    .style('border', '2px solid rgba(255,255,255,0.3)');

function showTooltip(event, d) {
    const connections = networkLinks.filter(l => 
        l.source.id === d.id || l.target.id === d.id
    );
    
    const topConnections = connections
        .map(l => ({
            char: l.source.id === d.id ? l.target.id : l.source.id,
            count: l.strength
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    let html = `
        <div style="border-bottom: 2px solid ${d.color}; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 15px;">${d.name}</strong>
        </div>
        <div style="margin-bottom: 6px;">
            <strong>Fights:</strong> ${d.fights}<br>
            <strong>Books:</strong> ${d.books.join(', ')}
        </div>
    `;
    
    if (topConnections.length > 0) {
        html += `<div style="font-size: 11px; color: #aaa; margin-top: 8px;">
            <strong>Top Connections:</strong><br>`;
        topConnections.forEach(c => {
            html += `• ${c.char} (${c.count}x)<br>`;
        });
        html += `</div>`;
    }
    
    html += `<div style="font-size: 10px; color: #666; margin-top: 8px; font-style: italic;">
        Click to filter fights
    </div>`;
    
    networkTooltip.html(html)
        .style('visibility', 'visible')
        .style('opacity', 1);
    
    updateTooltipPosition(event);
}

function hideTooltip() {
    networkTooltip
        .style('opacity', 0)
        .style('visibility', 'hidden');
}

function updateTooltipPosition(event) {
    networkTooltip
        .style('top', (event.pageY + 15) + 'px')
        .style('left', (event.pageX + 15) + 'px');
}

// Character filtering (to be connected with map bubbles)
function toggleCharacterFilter(character) {
    if (selectedCharacters.has(character.id)) {
        selectedCharacters.delete(character.id);
    } else {
        selectedCharacters.add(character.id);
    }
    
    console.log('Selected characters:', Array.from(selectedCharacters));
    
    // Update highlights
    updateNetworkHighlights();
    
    // Update map filter
    updateMapFilter();
}

// Update network visual highlights based on selected characters
function updateNetworkHighlights() {
    if (selectedCharacters.size === 0) {
        // No filter - reset everything
        nodeElements.selectAll('circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 1);
        
        linkElements
            .attr('stroke', '#95A5A6')
            .attr('stroke-opacity', 0.3);
    } else {
        // Filter active - highlight selected and connected
        nodeElements.selectAll('circle')
            .attr('stroke', d => selectedCharacters.has(d.id) ? '#FFD700' : '#fff')
            .attr('stroke-width', d => selectedCharacters.has(d.id) ? 4 : 2)
            .attr('opacity', d => {
                if (selectedCharacters.has(d.id)) return 1;
                // Check if connected to any selected
                const isConnected = networkLinks.some(l => {
                    const isLinked = (l.source.id === d.id || l.target.id === d.id);
                    const hasSelectedNode = selectedCharacters.has(l.source.id) || 
                                           selectedCharacters.has(l.target.id);
                    return isLinked && hasSelectedNode;
                });
                return isConnected ? 0.7 : 0.2;
            });
        
        // Highlight links connected to selected characters
        linkElements
            .attr('stroke', l => {
                const hasSelected = selectedCharacters.has(l.source.id) || 
                                   selectedCharacters.has(l.target.id);
                return hasSelected ? '#FFD700' : '#95A5A6';
            })
            .attr('stroke-opacity', l => {
                const hasSelected = selectedCharacters.has(l.source.id) || 
                                   selectedCharacters.has(l.target.id);
                return hasSelected ? 0.8 : 0.1;
            });
    }
}

// Reset all filters
function resetFilters() {
    selectedCharacters.clear();
    console.log('Filters reset');
    updateNetworkHighlights();
    updateMapFilter();
}

function updateMapFilter() {
    // Get selected characters
    const selected = Array.from(selectedCharacters);
    console.log('Filtering map to characters:', selected);
    
    // Filter the map bubbles
    if (window.mapBubbles) {
        window.mapBubbles.selectAll('circle')
            .transition()
            .duration(300)
            .attr('opacity', d => {
                if (selected.length === 0) return 0.85; // No filter - show all
                const hasMatch = d.all_characters && d.all_characters.some(c => selected.includes(c));
                return hasMatch ? 0.95 : 0.15; // Dim non-matching fights
            })
            .attr('stroke-width', d => {
                if (selected.length === 0) return 2;
                const hasMatch = d.all_characters && d.all_characters.some(c => selected.includes(c));
                return hasMatch ? 3 : 1;
            });
        
        // Update count
        if (window.currentFights) {
            const filteredFights = window.currentFights.filter(fight => {
                if (selected.length === 0) return true;
                return fight.all_characters && fight.all_characters.some(char => selected.includes(char));
            });        }
    }
}

window.characterNetwork = {
    create: createCharacterNetwork,
    getSelectedCharacters: () => Array.from(selectedCharacters),
    resetFilters: resetFilters 
};