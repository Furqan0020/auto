/**
 * AutomataGraph - D3.js Force-Directed Graph Visualization
 * Features: Double circle for final states, curved self-loops, edge merging, collision detection
 * Group 4 - Furqan Azeem
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AutomataGraph = ({ automaton, highlightedState = null }) => {
  const svgRef = useRef();
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!automaton || !automaton.states || !automaton.transitions) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 600;
    const nodeRadius = 30;

    svg.attr('width', width).attr('height', height);

    // Create container groups
    const g = svg.append('g');
    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Prepare nodes
    const nodes = automaton.states.map(state => ({
      id: state.id,
      isStart: state.isStart,
      isAccept: state.isAccept,
      label: `q${state.id}`
    }));

    // Merge transitions with the same source and target
    const linkMap = new Map();
    automaton.transitions.forEach(t => {
      const key = `${t.from}-${t.to}`;
      if (linkMap.has(key)) {
        linkMap.get(key).symbols.push(t.symbol);
      } else {
        linkMap.set(key, {
          source: t.from,
          target: t.to,
          symbols: [t.symbol]
        });
      }
    });

    const links = Array.from(linkMap.values()).map(link => ({
      ...link,
      label: link.symbols.join(', ')
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(150)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius + 20))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // Draw links
    const linkElements = linkGroup.selectAll('g')
      .data(links)
      .join('g')
      .attr('class', 'link-group');

    // Draw link paths
    linkElements.append('path')
      .attr('class', 'link-path')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw label backgrounds (white rectangles)
    linkElements.append('rect')
      .attr('class', 'link-label-bg')
      .attr('fill', 'white')
      .attr('rx', 3)
      .attr('ry', 3);

    // Draw link labels
    linkElements.append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#1e293b')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(d => d.label);

    // Draw nodes
    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Outer circle for normal states
    nodeElements.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => {
        if (d.isStart) return '#dcfce7';
        if (d.isAccept) return '#dbeafe';
        return 'white';
      })
      .attr('stroke', d => {
        if (d.isStart) return '#22c55e';
        if (d.isAccept) return '#3b82f6';
        return '#94a3b8';
      })
      .attr('stroke-width', 3);

    // Inner circle for accept states (double circle)
    nodeElements.filter(d => d.isAccept)
      .append('circle')
      .attr('r', nodeRadius - 6)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Node labels
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(d => d.label);

    // Add start arrow indicator
    const startNode = nodes.find(n => n.isStart);
    if (startNode) {
      g.append('line')
        .attr('class', 'start-arrow')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#start-arrowhead)');
    }

    // Define arrowhead markers
    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 8)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    defs.append('marker')
      .attr('id', 'start-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#22c55e');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link paths
      linkElements.each(function(d) {
        const group = d3.select(this);
        const path = group.select('.link-path');
        const label = group.select('.link-label');
        const labelBg = group.select('.link-label-bg');

        const sourceNode = nodes.find(n => n.id === d.source.id);
        const targetNode = nodes.find(n => n.id === d.target.id);

        if (!sourceNode || !targetNode) return;

        const sx = sourceNode.x;
        const sy = sourceNode.y;
        const tx = targetNode.x;
        const ty = targetNode.y;

        // Self-loop detection
        if (d.source.id === d.target.id) {
          // Draw curved self-loop
          const loopRadius = 35;
          const angle = -Math.PI / 2;
          const cx = sx + loopRadius * Math.cos(angle);
          const cy = sy + loopRadius * Math.sin(angle);

          path.attr('d', `
            M ${sx},${sy - nodeRadius}
            A ${loopRadius},${loopRadius} 0 1,1 ${sx + nodeRadius * 0.7},${sy - nodeRadius * 0.7}
          `);

          // Position label above
          label.attr('x', cx).attr('y', cy - 15);
          
          // Position background
          const bbox = label.node().getBBox();
          labelBg
            .attr('x', bbox.x - 3)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 6)
            .attr('height', bbox.height + 4);

        } else {
          // Check for bidirectional links
          const reverseLink = links.find(l => l.source.id === d.target.id && l.target.id === d.source.id);
          
          if (reverseLink && d.source.id < d.target.id) {
            // Curve the path
            const dx = tx - sx;
            const dy = ty - sy;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            
            path.attr('d', `M ${sx},${sy} A ${dr},${dr} 0 0,1 ${tx},${ty}`);
          } else if (reverseLink) {
            // Other direction of bidirectional
            const dx = tx - sx;
            const dy = ty - sy;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            
            path.attr('d', `M ${sx},${sy} A ${dr},${dr} 0 0,0 ${tx},${ty}`);
          } else {
            // Straight line
            path.attr('d', `M ${sx},${sy} L ${tx},${ty}`);
          }

          // Position label at midpoint
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;
          
          label.attr('x', midX).attr('y', midY - 8);
          
          // Position background
          const bbox = label.node().getBBox();
          labelBg
            .attr('x', bbox.x - 3)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 6)
            .attr('height', bbox.height + 4);
        }
      });

      // Update node positions
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);

      // Update start arrow
      if (startNode) {
        g.select('.start-arrow')
          .attr('x1', startNode.x - 60)
          .attr('y1', startNode.y)
          .attr('x2', startNode.x - nodeRadius - 5)
          .attr('y2', startNode.y);
      }
    });

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

    return () => {
      simulation.stop();
    };

  }, [automaton]);

  // Update highlighted state
  useEffect(() => {
    if (!automaton || highlightedState === null) return;

    const svg = d3.select(svgRef.current);
    
    // Reset all node colors
    svg.selectAll('.node circle')
      .attr('fill', function() {
        const node = d3.select(this.parentNode).datum();
        if (node.isStart) return '#dcfce7';
        if (node.isAccept) return '#dbeafe';
        return 'white';
      })
      .attr('stroke-width', function() {
        const node = d3.select(this.parentNode).datum();
        return node.isAccept ? 3 : 3;
      });

    // Highlight the active state
    if (highlightedState !== null) {
      svg.selectAll('.node')
        .filter(d => d.id === highlightedState)
        .select('circle')
        .attr('fill', '#fef08a')
        .attr('stroke', '#eab308')
        .attr('stroke-width', 4);
    }

  }, [highlightedState, automaton]);

  return (
    <div style={{ 
      border: '2px solid #e2e8f0', 
      borderRadius: '8px', 
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <svg ref={svgRef} style={{ display: 'block' }}></svg>
    </div>
  );
};

export default AutomataGraph;
