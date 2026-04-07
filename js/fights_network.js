const networkConfig = {
    width: 600,
    height: 560,
    outerWidth: 640,
    outerHeight: 660,
    paddingX: 20,
    paddingTop: 70,
    paddingBottom: 20,
    backgroundColor: '#e8d9b5',

    nodeColors: {
        'Water': '#235e8c',
        'Earth': '#4a6a22',
        'Fire': '#b84e10',
        'default': '#5a3e22'
    },

    minFightsThreshold: 3,
    minConnectionStrength: 1
};

// Map character names to image file paths here.
// If a character is missing from this object, the node falls back to a colored circle.
const characterImages = {
    'Aang': 'img/aang.png',
    'Katara': 'img/katara.png',
    'Sokka': 'img/sokka.png',
    'Toph': 'img/toph.png',
    'Zuko': 'img/zuko.png',
    'Azula': 'img/azula.png',
    'Iroh': 'img/iroh.png',
    'Suki': 'img/suki.png',
    'Ty Lee': 'img/tylee.png',
    'Mai': 'img/mai.png',
    'Ozai': 'img/ozai.png',
    'Jet': 'img/jet.png',
    'Zhao': 'img/zhao.png',
    'Roku': 'img/roku.png',
    'Combustion Man': 'img/combustionman.png',
};

let selectedCharacters = new Set();
let networkNodes = [];
let networkLinks = [];
let simulation;
let nodeElements;
let linkElements;

function safeId(str) {
    return String(str).replace(/[^a-zA-Z0-9_-]/g, '-');
}

function createCharacterNetwork(fightsData) {
    const networkContainer = d3.select('.frame3-viz-row')
        .append('div')
        .attr('id', 'network-container');

    const networkSvg = networkContainer
        .append('svg')
        .attr('width', networkConfig.outerWidth)
        .attr('height', networkConfig.outerHeight)
        .attr('viewBox', `0 0 ${networkConfig.outerWidth} ${networkConfig.outerHeight}`)
        .style('background-color', networkConfig.backgroundColor)
        .style('display', 'block');

    // Background
    networkSvg.append('rect')
        .attr('width', networkConfig.outerWidth)
        .attr('height', networkConfig.outerHeight)
        .attr('fill', networkConfig.backgroundColor);

    // Border
    networkSvg.append('rect')
        .attr('x', 8)
        .attr('y', 8)
        .attr('width', networkConfig.outerWidth - 16)
        .attr('height', networkConfig.outerHeight - 16)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'none')
        .attr('stroke', '#5a3e22')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7);

    const titleCenterX = networkConfig.outerWidth / 2;

    // Title
    networkSvg.append('text')
        .attr('x', titleCenterX)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-family', "'Uncial Antiqua', cursive")
        .style('fill', '#2c1f0e')
        .style('letter-spacing', '0.06em')
        .text('Character Fight Network');

    // Underline
    networkSvg.append('line')
        .attr('x1', titleCenterX - 120)
        .attr('x2', titleCenterX + 120)
        .attr('y1', 36)
        .attr('y2', 36)
        .attr('stroke', 'rgba(44,31,14,0.2)')
        .attr('stroke-width', 1);

    // Inner plotting group
    const networkGroup = networkSvg.append('g')
        .attr('class', 'network-content')
        .attr('transform', `translate(${networkConfig.paddingX}, ${networkConfig.paddingTop})`);

    // Process fight data
    const characterStats = new Map();
    const connectionMatrix = new Map();

    fightsData.fights.forEach(fight => {
        const characters = fight.all_characters || [];

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

        for (let i = 0; i < characters.length; i++) {
            for (let j = i + 1; j < characters.length; j++) {
                const char1 = characters[i];
                const char2 = characters[j];
                const key = [char1, char2].sort().join('-');
                connectionMatrix.set(key, (connectionMatrix.get(key) || 0) + 1);

                const stats1 = characterStats.get(char1);
                const stats2 = characterStats.get(char2);
                stats1.connections.set(char2, (stats1.connections.get(char2) || 0) + 1);
                stats2.connections.set(char1, (stats2.connections.get(char1) || 0) + 1);
            }
        }
    });

    // Filter to significant characters
    const significantCharacters = Array.from(characterStats.values())
        .filter(char => char.fights >= networkConfig.minFightsThreshold)
        .sort((a, b) => b.fights - a.fights);

    // Determine primary book per character
    significantCharacters.forEach(char => {
        const bookCounts = { Water: 0, Earth: 0, Fire: 0 };
        fightsData.fights.forEach(fight => {
            if (fight.all_characters && fight.all_characters.includes(char.name)) {
                bookCounts[fight.book]++;
            }
        });
        char.primaryBook = Object.keys(bookCounts).reduce((a, b) =>
            bookCounts[a] > bookCounts[b] ? a : b
        );
    });

    // Size scale
    const nodeSizeScale = d3.scaleSqrt()
        .domain([
            networkConfig.minFightsThreshold,
            d3.max(significantCharacters, d => d.fights) || networkConfig.minFightsThreshold
        ])
        .range([20, 50]);

    networkNodes = significantCharacters.map((char) => ({
        id: char.name,
        name: char.name,
        fights: char.fights,
        books: Array.from(char.books),
        primaryBook: char.primaryBook,
        radius: nodeSizeScale(char.fights),
        color: networkConfig.nodeColors[char.primaryBook] || networkConfig.nodeColors.default,
        image: characterImages[char.name] || null,
        x: Math.random() * networkConfig.width,
        y: Math.random() * networkConfig.height
    }));

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

    const maxStrength = d3.max(networkLinks, d => d.strength) || 1;

    const linkWidthScale = d3.scaleLinear()
        .domain([1, maxStrength])
        .range([2, 12]);

    // Clip paths for round images
    const defs = networkSvg.append('defs');

    networkNodes.forEach(d => {
        defs.append('clipPath')
            .attr('id', `clip-${safeId(d.id)}`)
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', d.radius);
    });

    // Force simulation
    simulation = d3.forceSimulation(networkNodes)
        .force('link', d3.forceLink(networkLinks)
            .id(d => d.id)
            .distance(d => Math.max(40, 100 - linkWidthScale(d.strength) * 6))
            .strength(d => linkWidthScale(d.strength) / 10)
        )
        .force('charge', d3.forceManyBody().strength(-350).distanceMax(500))
        .force('center', d3.forceCenter(networkConfig.width / 2, networkConfig.height / 2))
        .force('collision', d3.forceCollide().radius(d => d.radius + 14))
        .force('x', d3.forceX(networkConfig.width / 2).strength(0.05))
        .force('y', d3.forceY(networkConfig.height / 2).strength(0.05));

    // Links
    linkElements = networkGroup.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(networkLinks)
        .join('line')
        .attr('stroke', 'rgba(44,31,14,0.18)')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', d => linkWidthScale(d.strength));

    // Node groups
    nodeElements = networkGroup.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(networkNodes)
        .join('g')
        .attr('class', 'node')
        .call(
            d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded)
        );

    // Fallback/background ring
    nodeElements.append('circle')
        .attr('class', 'node-ring')
        .attr('r', d => d.radius)
        .attr('fill', 'white')
        .attr('stroke', '#e8d9b5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85);

    // colored ring (only visible when no image)
    nodeElements.append('circle')
        .attr('class', 'node-ring')
        .attr('r', d => d.radius)
        .attr('fill', d => d.image ? 'transparent' : d.color)
        .attr('stroke', '#e8d9b5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85);

    // Images only for nodes that have one
    nodeElements.filter(d => d.image)
        .append('image')
        .attr('class', 'node-image')
        .attr('href', d => d.image)
        .attr('x', d => -d.radius * 0.9)
        .attr('y', d => -d.radius * 0.9)
        .attr('width', d => d.radius * 1.8)
        .attr('height', d => d.radius * 1.8)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('clip-path', d => `url(#clip-${safeId(d.id)})`)
        .style('pointer-events', 'none');

    // Top border ring
    nodeElements.append('circle')
        .attr('class', 'node-stroke')
        .attr('r', d => d.radius)
        .attr('fill', 'none')
        .attr('stroke', '#e8d9b5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.95)
        .style('pointer-events', 'none');

    // Invisible hit area for interaction
    nodeElements.append('circle')
        .attr('class', 'node-hitarea')
        .attr('r', d => d.radius)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            if (selectedCharacters.size === 0) {
                d3.select(this.parentNode).select('.node-stroke')
                    .attr('stroke', '#2c1f0e')
                    .attr('stroke-width', 2.5);

                linkElements
                    .attr('stroke-opacity', l =>
                        (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.06
                    )
                    .attr('stroke', l =>
                        (l.source.id === d.id || l.target.id === d.id)
                            ? d.color
                            : 'rgba(44,31,14,0.18)'
                    );

                nodeElements.selectAll('.node-ring, .node-image, .node-stroke')
                    .attr('opacity', n => {
                        if (n.id === d.id) return 1;
                        const isConnected = networkLinks.some(l =>
                            (l.source.id === d.id && l.target.id === n.id) ||
                            (l.target.id === d.id && l.source.id === n.id)
                        );
                        return isConnected ? 0.9 : 0.2;
                    });
            }
            showTooltip(event, d);
        })
        .on('mousemove', function(event) {
            updateTooltipPosition(event);
        })
        .on('mouseout', function() {
            if (selectedCharacters.size === 0) {
                d3.select(this.parentNode).select('.node-stroke')
                    .attr('stroke', '#e8d9b5')
                    .attr('stroke-width', 1.5);

                linkElements
                    .attr('stroke-opacity', 1)
                    .attr('stroke', 'rgba(44,31,14,0.18)');

                nodeElements.selectAll('.node-ring, .node-image, .node-stroke')
                    .attr('opacity', function() {
                        return d3.select(this).classed('node-image') ? 0.98 : 0.85;
                    });
            }
            hideTooltip();
        })
        .on('click', function(event, d) {
            toggleCharacterFilter(d);
            event.stopPropagation();
        });

    // Labels for top 10 characters
    const topCharacters = networkNodes;

    nodeElements.filter(d => topCharacters.includes(d))
        .append('text')
        .attr('dy', d => d.radius + 16)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-family', "'Philosopher', serif")
        .style('fill', '#2c1f0e')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('paint-order', 'stroke')
        .style('stroke', '#f0e6cc')
        .style('stroke-width', '3px')
        .style('stroke-linejoin', 'round')
        .text(d => d.name);

    // Tick update
    simulation.on('tick', () => {
        linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Reset button
    const resetButton = networkSvg.append('g')
        .attr('class', 'reset-button')
        .attr('transform', `translate(${networkConfig.outerWidth - 126}, 14)`)
        .style('cursor', 'pointer')
        .on('click', resetFilters);

    resetButton.append('rect')
        .attr('width', 104)
        .attr('height', 28)
        .attr('fill', 'transparent')
        .attr('stroke', 'rgba(44,31,14,0.45)')
        .attr('stroke-width', 1.5)
        .attr('rx', 3);

    resetButton.append('text')
        .attr('x', 52)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .style('fill', '#2c1f0e')
        .style('font-size', '11px')
        .style('font-family', "'Uncial Antiqua', cursive")
        .style('letter-spacing', '0.04em')
        .style('pointer-events', 'none')
        .text('Reset Filter');

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

    return { nodes: networkNodes, links: networkLinks, simulation };
}

// Tooltip
const networkTooltip = d3.select('body')
    .append('div')
    .attr('class', 'network-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('opacity', 0)
    .style('background-color', '#f0e6cc')
    .style('color', '#2c1f0e')
    .style('padding', '11px 14px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('font-family', "'Philosopher', serif")
    .style('pointer-events', 'none')
    .style('z-index', '10001')
    .style('max-width', '260px')
    .style('box-shadow', '2px 4px 14px rgba(44,31,14,0.25)')
    .style('border', '1px solid rgba(44,31,14,0.2)');

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
        <div style="border-bottom:1px solid rgba(44,31,14,0.2);padding-bottom:6px;margin-bottom:6px;">
            <strong style="font-family:'Uncial Antiqua',cursive;font-size:13px;">${d.name}</strong>
        </div>
        <div style="margin-bottom:5px;">
            <span style="font-size:10px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Fights</span>
            <span style="font-weight:bold;margin-left:4px;">${d.fights}</span><br>
            <span style="font-size:10px;color:#5a3e22;text-transform:uppercase;letter-spacing:0.05em;">Books</span>
            <span style="margin-left:4px;">${d.books.join(', ')}</span>
        </div>
    `;

    if (topConnections.length > 0) {
        html += `<div style="font-size:10px;color:#5a3e22;margin-top:6px;">
            <span style="text-transform:uppercase;letter-spacing:0.05em;">Top Connections</span><br>`;
        topConnections.forEach(c => {
            html += `<span style="color:#2c1f0e;">• ${c.char}</span> <span style="color:#5a3e22;">(${c.count}×)</span><br>`;
        });
        html += `</div>`;
    }

    html += `<div style="font-size:10px;color:#5a3e22;margin-top:6px;font-style:italic;">
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

// Character filtering
function toggleCharacterFilter(character) {
    if (selectedCharacters.has(character.id)) {
        selectedCharacters.delete(character.id);
    } else {
        selectedCharacters.add(character.id);
    }
    updateNetworkHighlights();
    updateMapFilter();
}

function updateNetworkHighlights() {
    if (selectedCharacters.size === 0) {
        nodeElements.selectAll('.node-stroke')
            .attr('stroke', '#e8d9b5')
            .attr('stroke-width', 1.5);

        nodeElements.selectAll('.node-ring')
            .attr('opacity', 0.85);

        nodeElements.selectAll('.node-image')
            .attr('opacity', 0.98);

        nodeElements.selectAll('.node-stroke')
            .attr('opacity', 0.95);

        linkElements
            .attr('stroke', 'rgba(44,31,14,0.18)')
            .attr('stroke-opacity', 1);
    } else {
        nodeElements.selectAll('.node-stroke')
            .attr('stroke', d => selectedCharacters.has(d.id) ? '#2c1f0e' : '#e8d9b5')
            .attr('stroke-width', d => selectedCharacters.has(d.id) ? 3 : 1.5);

        nodeElements.selectAll('.node-ring')
            .attr('opacity', d => {
                if (selectedCharacters.has(d.id)) return 1;
                const isConnected = networkLinks.some(l => {
                    const isLinked = (l.source.id === d.id || l.target.id === d.id);
                    const hasSelectedNode = selectedCharacters.has(l.source.id) ||
                        selectedCharacters.has(l.target.id);
                    return isLinked && hasSelectedNode;
                });
                return isConnected ? 0.2 : 0.3;
            });

        nodeElements.selectAll('.node-image')
            .attr('opacity', d => {
                if (selectedCharacters.has(d.id)) return 1;
                const isConnected = networkLinks.some(l => {
                    const isLinked = (l.source.id === d.id || l.target.id === d.id);
                    const hasSelectedNode = selectedCharacters.has(l.source.id) ||
                        selectedCharacters.has(l.target.id);
                    return isLinked && hasSelectedNode;
                });
                return isConnected ? 0.2 : 0.3;
            });

        nodeElements.selectAll('.node-stroke')
            .attr('opacity', d => {
                if (selectedCharacters.has(d.id)) return 1;
                const isConnected = networkLinks.some(l => {
                    const isLinked = (l.source.id === d.id || l.target.id === d.id);
                    const hasSelectedNode = selectedCharacters.has(l.source.id) ||
                        selectedCharacters.has(l.target.id);
                    return isLinked && hasSelectedNode;
                });
                return isConnected ? 0.2 : 0.3;
            });

        linkElements
            .attr('stroke', l => {
                const hasSelected = selectedCharacters.has(l.source.id) ||
                    selectedCharacters.has(l.target.id);
                return hasSelected ? 'rgba(44,31,14,0.7)' : 'rgba(44,31,14,0.08)';
            })
            .attr('stroke-opacity', 1);
    }
}

function resetFilters() {
    selectedCharacters.clear();
    updateNetworkHighlights();
    updateMapFilter();
}

function updateMapFilter() {
    const selected = Array.from(selectedCharacters);

    if (window.mapBubbles) {
        window.mapBubbles.selectAll('circle')
            .transition()
            .duration(300)
            .attr('opacity', d => {
                if (selected.length === 0) return 0.82;
                const hasMatch = d.all_characters && selected.every(c => d.all_characters.includes(c));
                return hasMatch ? 1 : 0.1;
            })
            .attr('stroke-width', d => {
                if (selected.length === 0) return 1.5;
                const hasMatch = d.all_characters && selected.every(c => d.all_characters.includes(c));
                return hasMatch ? 2.5 : 0.8;
            });

        if (window.currentFights) {
            window.currentFights.filter(fight => {
                if (selected.length === 0) return true;
                return fight.all_characters && fight.all_characters.some(char => selected.includes(char));
            });
        }
    }
}

function highlightFromMap(characters, color) {
    // Don't override an active click-filter selection
    if (selectedCharacters.size > 0) return;
    if (!characters || characters.length === 0) return;

    const charSet = new Set(characters);

    nodeElements.selectAll('.node-stroke')
        .attr('stroke', d => charSet.has(d.id) ? color : '#e8d9b5')
        .attr('stroke-width', d => charSet.has(d.id) ? 3 : 1.5)
        .attr('opacity', d => charSet.has(d.id) ? 1 : 0.95);

    nodeElements.selectAll('.node-ring')
        .attr('opacity', d => charSet.has(d.id) ? 1 : 0.25);

    nodeElements.selectAll('.node-image')
        .attr('opacity', d => charSet.has(d.id) ? 1 : 0.25);

    linkElements
        .attr('stroke', l => {
            const bothInFight = charSet.has(l.source.id) && charSet.has(l.target.id);
            return bothInFight ? color : 'rgba(44,31,14,0.08)';
        })
        .attr('stroke-opacity', l => {
            const bothInFight = charSet.has(l.source.id) && charSet.has(l.target.id);
            return bothInFight ? 0.85 : 0.08;
        });
}

function clearMapHighlight() {
    if (selectedCharacters.size > 0) return;

    nodeElements.selectAll('.node-stroke')
        .attr('stroke', '#e8d9b5')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.95);

    nodeElements.selectAll('.node-ring')
        .attr('opacity', 0.85);

    nodeElements.selectAll('.node-image')
        .attr('opacity', 0.98);

    linkElements
        .attr('stroke', 'rgba(44,31,14,0.18)')
        .attr('stroke-opacity', 1);
}

window.characterNetwork = {
    create: createCharacterNetwork,
    getSelectedCharacters: () => Array.from(selectedCharacters),
    resetFilters: resetFilters,
    highlightFromMap: highlightFromMap,
    clearMapHighlight: clearMapHighlight
};