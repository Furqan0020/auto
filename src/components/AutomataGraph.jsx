/**
 * AutomataGraph - D3.js Force-Directed Graph Visualization
 * Features: Double circle for final states, curved self-loops, edge merging, collision detection
 * Group 4 - Furqan Azeem
 */

import { useEffect, useRef } from "react";
import * as d3 from "d3";

const AutomataGraph = ({ automaton, highlightedState = null }) => {
  const svgRef = useRef();
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!automaton || !automaton.states || !automaton.transitions) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 600;
    const nodeRadius = 30;

    svg.attr("width", width).attr("height", height);

    // Create container groups
    const g = svg.append("g");
    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Prepare nodes
    const nodes = automaton.states.map((state) => ({
      id: state.id,
      isStart: state.isStart,
      isAccept: state.isAccept,
      label: `q${state.id}`,
    }));

    // Merge transitions with the same source and target
    const linkMap = new Map();
    automaton.transitions.forEach((t) => {
      const key = `${t.from}-${t.to}`;
      if (linkMap.has(key)) {
        linkMap.get(key).symbols.push(t.symbol);
      } else {
        linkMap.set(key, {
          source: t.from,
          target: t.to,
          symbols: [t.symbol],
        });
      }
    });

    // Build links array and detect bidirectional pairs and self-loops
    const links = Array.from(linkMap.values()).map((link) => ({
      ...link,
      label: link.symbols.join(", "),
      isSelf: link.source === link.target,
      // placeholder for curve offset, will be set below when reverse exists
      curve: 0,
    }));

    // Detect bidirectional links and assign curve offsets (+/-)
    const indexMap = new Map(); // key -> index
    links.forEach((l, i) => {
      indexMap.set(`${l.source}-${l.target}`, i);
    });

    links.forEach((l, i) => {
      if (l.isSelf) return;
      const reverseKey = `${l.target}-${l.source}`;
      if (indexMap.has(reverseKey)) {
        const j = indexMap.get(reverseKey);
        // assign opposite curve offsets if not already assigned
        if (links[i].curve === 0 && links[j].curve === 0) {
          links[i].curve = 40; // px offset for control point
          links[j].curve = -40;
        }
      }
    });

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // Draw links
    const linkElements = linkGroup
      .selectAll("g")
      .data(links)
      .join("g")
      .attr("class", "link-group");

    // Draw link paths
    linkElements
      .append("path")
      .attr("class", "link-path")
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Draw label backgrounds (white rectangles)
    linkElements
      .append("rect")
      .attr("class", "link-label-bg")
      .attr("fill", "white")
      .attr("rx", 3)
      .attr("ry", 3);

    // Draw link labels
    linkElements
      .append("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d) => d.label);

    // Draw nodes
    const nodeElements = nodeGroup
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    // Outer circle for normal states
    nodeElements
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => {
        if (d.isStart) return "#dcfce7";
        if (d.isAccept) return "#dbeafe";
        return "white";
      })
      .attr("stroke", (d) => {
        if (d.isStart) return "#22c55e";
        if (d.isAccept) return "#3b82f6";
        return "#94a3b8";
      })
      .attr("stroke-width", 3);

    // Inner circle for accept states (double circle)
    nodeElements
      .filter((d) => d.isAccept)
      .append("circle")
      .attr("r", nodeRadius - 6)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    // Node labels
    nodeElements
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b")
      .text((d) => d.label);

    // Add start arrow indicator
    const startNode = nodes.find((n) => n.isStart);
    if (startNode) {
      g.append("line")
        .attr("class", "start-arrow")
        .attr("stroke", "#22c55e")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#start-arrowhead)");
    }

    // Define arrowhead markers
    const defs = svg.append("defs");

    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", nodeRadius + 8)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    defs
      .append("marker")
      .attr("id", "start-arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#22c55e");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      // Update link paths
      linkElements.each(function (d) {
        const group = d3.select(this);
        const path = group.select(".link-path");
        const label = group.select(".link-label");
        const labelBg = group.select(".link-label-bg");

        const sourceNode = nodes.find((n) => n.id === d.source.id);
        const targetNode = nodes.find((n) => n.id === d.target.id);

        if (!sourceNode || !targetNode) return;

        const sx = sourceNode.x;
        const sy = sourceNode.y;
        const tx = targetNode.x;
        const ty = targetNode.y;

        // Self-loop detection
        if (d.isSelf || d.source.id === d.target.id) {
          // Draw cubic Bezier self-loop that goes out and comes back
          const loopRadius = 40;
          const cp1x = sx + loopRadius;
          const cp1y = sy - loopRadius * 1.2;
          const cp2x = sx + loopRadius;
          const cp2y = sy + loopRadius * 1.2;
          const ex = sx;
          const ey = sy - nodeRadius - 6;

          path
            .attr(
              "d",
              `M ${sx},${
                sy - nodeRadius
              } C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`
            )
            .attr("marker-end", ""); // remove arrowhead for self-loop to avoid overlap

          // Label position: evaluate cubic Bezier at t=0.5
          const t = 0.5;
          const x =
            Math.pow(1 - t, 3) * sx +
            3 * Math.pow(1 - t, 2) * t * cp1x +
            3 * (1 - t) * Math.pow(t, 2) * cp2x +
            Math.pow(t, 3) * ex;
          const y =
            Math.pow(1 - t, 3) * (sy - nodeRadius) +
            3 * Math.pow(1 - t, 2) * t * cp1y +
            3 * (1 - t) * Math.pow(t, 2) * cp2y +
            Math.pow(t, 3) * ey;

          label.attr("x", x).attr("y", y - 8);
          const bbox = label.node().getBBox();
          labelBg
            .attr("x", bbox.x - 3)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 6)
            .attr("height", bbox.height + 4);
        } else {
          // Non-self links: check if we assigned a curve offset earlier
          const curve = d.curve || 0;

          if (curve !== 0) {
            // Quadratic Bezier with control point offset perpendicular to the line
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;
            const dx = tx - sx;
            const dy = ty - sy;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len; // normal vector
            const ny = dx / len;
            const cx = mx + nx * curve;
            const cy = my + ny * curve;

            path.attr("d", `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`);

            // Label at quadratic Bezier midpoint (t=0.5): P = 0.25 P0 + 0.5 C + 0.25 P1
            const lx = 0.25 * sx + 0.5 * cx + 0.25 * tx;
            const ly = 0.25 * sy + 0.5 * cy + 0.25 * ty;
            label.attr("x", lx).attr("y", ly - 8);
          } else {
            // Straight line
            path.attr("d", `M ${sx},${sy} L ${tx},${ty}`);
            const midX = (sx + tx) / 2;
            const midY = (sy + ty) / 2;
            label.attr("x", midX).attr("y", midY - 8);
          }

          // Position background for non-self links
          const bbox = label.node().getBBox();
          labelBg
            .attr("x", bbox.x - 3)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 6)
            .attr("height", bbox.height + 4);
        }
      });

      // Update node positions
      nodeElements.attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Update start arrow
      if (startNode) {
        g.select(".start-arrow")
          .attr("x1", startNode.x - 60)
          .attr("y1", startNode.y)
          .attr("x2", startNode.x - nodeRadius - 5)
          .attr("y2", startNode.y);
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
    svg
      .selectAll(".node circle")
      .attr("fill", function () {
        const node = d3.select(this.parentNode).datum();
        if (node.isStart) return "#dcfce7";
        if (node.isAccept) return "#dbeafe";
        return "white";
      })
      .attr("stroke-width", function () {
        const node = d3.select(this.parentNode).datum();
        return node.isAccept ? 3 : 3;
      });

    // Highlight the active state
    if (highlightedState !== null) {
      svg
        .selectAll(".node")
        .filter((d) => d.id === highlightedState)
        .select("circle")
        .attr("fill", "#fef08a")
        .attr("stroke", "#eab308")
        .attr("stroke-width", 4);
    }
  }, [highlightedState, automaton]);

  return (
    <div
      style={{
        border: "2px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
      }}
    >
      <svg ref={svgRef} style={{ display: "block" }}></svg>
    </div>
  );
};

export default AutomataGraph;
