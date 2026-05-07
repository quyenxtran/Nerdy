"use client";

import { Filter, LocateFixed, Search, ZoomIn, ZoomOut } from "lucide-react";
import { Application, Container, Graphics, Text } from "pixi.js";
import type { FederatedPointerEvent } from "pixi.js";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode, GraphPath } from "@/lib/mock-data";

type GraphType = GraphNode["type"];

type DisplayNode = GraphNode & {
  baseId: string;
  particle: boolean;
  radius: number;
  vx: number;
  vy: number;
  fixed?: boolean;
};

async function postGraphNodeSignal(node: DisplayNode) {
  try {
    await fetch("/api/signals", {
      body: JSON.stringify({
        entityId: node.baseId,
        entityType: "graph_node",
        metadata: {
          group: node.group,
          nodeType: node.type,
          sourcePaperId: node.sourcePaperId ?? ""
        },
        type: "graph_node_open",
        weight: 0.7
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
  } catch {
    // Graph exploration should stay responsive if the signal API is unavailable.
  }
}

type DisplayEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  weight: number;
  evidence: string;
  satellite?: boolean;
};

const TYPE_LABELS: Record<GraphType, string> = {
  paper: "Papers",
  claim: "Claims",
  method: "Methods",
  descriptor: "Descriptors",
  thesis: "Thesis",
  question: "Questions"
};

const TYPE_COLORS: Record<GraphType, number> = {
  paper: 0xd8ba75,
  claim: 0xd87072,
  method: 0xd36d9e,
  descriptor: 0xb8d77d,
  thesis: 0x7c96e8,
  question: 0x6fd0dc
};

const TYPE_ORDER: GraphType[] = ["paper", "claim", "method", "descriptor", "thesis", "question"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seededUnit(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

function toWorldX(x: number) {
  return (x - 50) * 11;
}

function toWorldY(y: number) {
  return (y - 50) * 8;
}

function buildDisplayGraph(nodes: GraphNode[], edges: GraphEdge[], activeTypes: Set<GraphType>) {
  const hubNodes: DisplayNode[] = nodes
    .filter((node) => activeTypes.has(node.type))
    .map((node) => ({
      ...node,
      x: toWorldX(node.x),
      y: toWorldY(node.y),
      baseId: node.id,
      particle: false,
      radius: 8 + node.weight * 10,
      vx: 0,
      vy: 0
    }));
  const hubIds = new Set(hubNodes.map((node) => node.id));
  const satelliteNodes = hubNodes.flatMap((hub, hubIndex) => {
    const count = Math.round(16 + hub.weight * 24);

    return Array.from({ length: count }, (_, index) => {
      const seed = (hubIndex + 3) * 173 + index * 29;
      const angle = seededUnit(seed) * Math.PI * 2;
      const radius = 28 + seededUnit(seed + 11) * 92;

      return {
        ...hub,
        id: `${hub.id}-sat-${index}`,
        label: `${hub.label} evidence ${index + 1}`,
        x: hub.x + Math.cos(angle) * radius,
        y: hub.y + Math.sin(angle) * radius * 0.74,
        baseId: hub.id,
        particle: true,
        radius: 1.8 + seededUnit(seed + 23) * 2.6,
        vx: 0,
        vy: 0
      };
    });
  });
  const satelliteEdges: DisplayEdge[] = satelliteNodes.flatMap((node, index) => {
    const result: DisplayEdge[] = [
      {
        id: `${node.id}-hub`,
        from: node.id,
        to: node.baseId,
        relation: "EVIDENCE",
        weight: 0.16,
        evidence: "Derived evidence particle attached to a source graph node.",
        satellite: true
      }
    ];
    const sibling = satelliteNodes[index + 1];

    if (sibling && sibling.baseId === node.baseId && index % 4 === 0) {
      result.push({
        id: `${node.id}-sibling`,
        from: node.id,
        to: sibling.id,
        relation: "NEAR",
        weight: 0.08,
        evidence: "Visual cluster edge for local density.",
        satellite: true
      });
    }

    return result;
  });
  const graphEdges: DisplayEdge[] = edges
    .filter((edge) => hubIds.has(edge.from) && hubIds.has(edge.to))
    .map((edge) => ({ ...edge }));

  return {
    displayNodes: [...satelliteNodes, ...hubNodes],
    displayEdges: [...satelliteEdges, ...graphEdges],
    hubIds
  };
}

function connectedIds(edges: DisplayEdge[], nodeId: string) {
  const result = new Set<string>([nodeId]);

  edges.forEach((edge) => {
    if (edge.from === nodeId) {
      result.add(edge.to);
    }

    if (edge.to === nodeId) {
      result.add(edge.from);
    }
  });

  return result;
}

function pathNodeSet(paths: GraphPath[], activePathId: string | null) {
  const path = paths.find((item) => item.id === activePathId);
  return new Set(path?.nodeIds ?? []);
}

export function KnowledgeGraph({
  nodes,
  edges,
  paths,
  compact = false
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  paths: GraphPath[];
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<string | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const focusRef = useRef<string | null>(null);
  const pathRef = useRef<string | null>(null);
  const cameraCommandRef = useRef<"fit" | "zoomIn" | "zoomOut" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>("thesis");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>("thesis");
  const [activePathId, setActivePathId] = useState<string | null>("path-validation");
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<GraphType>>(() => new Set(TYPE_ORDER));

  const selectedNode = selectedId ? nodes.find((node) => node.id === selectedId) ?? null : null;
  const selectedEdges = selectedId ? edges.filter((edge) => edge.from === selectedId || edge.to === selectedId) : [];

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    hoveredRef.current = hoveredId;
  }, [hoveredId]);

  useEffect(() => {
    focusRef.current = focusId;
  }, [focusId]);

  useEffect(() => {
    pathRef.current = activePathId;
  }, [activePathId]);

  useEffect(() => {
    let cancelled = false;
    const containerEl = containerRef.current;

    if (!containerEl) {
      return;
    }

    const targetEl = containerEl;
    const app = new Application();
    const world = new Container();
    const edgeLayer = new Graphics();
    const glowLayer = new Graphics();
    const nodeLayer = new Container();
    const labelLayer = new Container();
    const nodeGraphics = new Map<string, Graphics>();
    const labelGraphics = new Map<string, Text>();
    const { displayNodes, displayEdges } = buildDisplayGraph(nodes, edges, activeTypes);
    const nodeMap = new Map(displayNodes.map((node) => [node.id, node]));
    const hubMap = new Map(displayNodes.filter((node) => !node.particle).map((node) => [node.id, node]));
    const camera = { x: 0, y: 0, scale: 0.76 };
    let draggedNode: DisplayNode | null = null;
    let isPanning = false;
    let lastPoint = { x: 0, y: 0 };
    let lastFocusId: string | null = null;
    let canvasEl: HTMLCanvasElement | null = null;
    let energy = 1;

    function applyCamera() {
      world.position.set(app.screen.width / 2 + camera.x, app.screen.height / 2 + camera.y);
      world.scale.set(camera.scale);
    }

    function fitView() {
      camera.scale = clamp(Math.min(app.screen.width / 1200, app.screen.height / 820), 0.5, 1.2);
      camera.x = 0;
      camera.y = 0;
      applyCamera();
    }

    function focusNode(id: string | null) {
      if (!id) {
        return;
      }

      const node = hubMap.get(id);

      if (!node) {
        return;
      }

      camera.x = -node.x * camera.scale;
      camera.y = -node.y * camera.scale;
      applyCamera();
    }

    function applyCameraCommand() {
      const command = cameraCommandRef.current;

      if (!command) {
        return;
      }

      cameraCommandRef.current = null;

      if (command === "fit") {
        fitView();
        return;
      }

      camera.scale = clamp(camera.scale * (command === "zoomIn" ? 1.16 : 0.86), 0.28, 2.4);
      applyCamera();
    }

    function applyForces() {
      if (energy < 0.006) {
        return;
      }

      for (let i = 0; i < displayNodes.length; i += 1) {
        const a = displayNodes[i];

        for (let j = i + 1; j < displayNodes.length; j += 1) {
          const b = displayNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distanceSquared = Math.max(dx * dx + dy * dy, 80);
          const distance = Math.sqrt(distanceSquared);
          const force = ((a.particle || b.particle ? 26 : 62) * energy) / distanceSquared;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          if (!a.fixed) {
            a.vx -= fx;
            a.vy -= fy;
          }

          if (!b.fixed) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      displayEdges.forEach((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);

        if (!from || !to) {
          return;
        }

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const target = edge.satellite ? 52 : 205 - edge.weight * 64;
        const force = (distance - target) * (edge.satellite ? 0.0007 : 0.0028) * energy;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        if (!from.fixed) {
          from.vx += fx;
          from.vy += fy;
        }

        if (!to.fixed) {
          to.vx -= fx;
          to.vy -= fy;
        }
      });

      displayNodes.forEach((node) => {
        if (!node.fixed) {
          node.vx += -node.x * (node.particle ? 0.00004 : 0.00008) * energy;
          node.vy += -node.y * (node.particle ? 0.00004 : 0.00008) * energy;
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.86;
          node.vy *= 0.86;
        }
      });

      energy *= 0.988;
    }

    function relationshipSet() {
      const selected = selectedRef.current;
      const hovered = hoveredRef.current;
      const activePath = pathNodeSet(paths, pathRef.current);
      const anchor = hovered || selected;
      const related = new Set<string>(activePath);

      if (anchor) {
        connectedIds(displayEdges, anchor).forEach((id) => related.add(id));
      }

      return { anchor, activePath, related };
    }

    function draw() {
      applyCameraCommand();
      applyForces();
      const { anchor, activePath, related } = relationshipSet();

      glowLayer.clear();
      edgeLayer.clear();

      hubMap.forEach((node) => {
        const color = TYPE_COLORS[node.type];
        glowLayer.circle(node.x, node.y, 90 + node.weight * 80).fill({ color, alpha: 0.035 });
      });

      displayEdges.forEach((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);

        if (!from || !to) {
          return;
        }

        const highlighted =
          activePath.has(from.baseId) && activePath.has(to.baseId) ||
          (anchor ? related.has(from.baseId) && related.has(to.baseId) : false);
        const alpha = edge.satellite ? (highlighted ? 0.22 : 0.08) : highlighted ? 0.82 : anchor || activePath.size ? 0.12 : 0.34;
        const width = edge.satellite ? 0.55 : 0.8 + edge.weight * 1.4;

        edgeLayer.moveTo(from.x, from.y);
        edgeLayer.lineTo(to.x, to.y);
        edgeLayer.stroke({ color: highlighted ? 0xdfe7ee : 0x7a8294, alpha, width });
      });

      displayNodes.forEach((node) => {
        const graphic = nodeGraphics.get(node.id);
        const label = labelGraphics.get(node.id);
        const highlighted = related.has(node.baseId) || node.baseId === anchor;
        const muted = Boolean(anchor || activePath.size) && !highlighted;

        if (graphic) {
          graphic.position.set(node.x, node.y);
          graphic.alpha = muted ? 0.18 : node.particle ? 0.72 : 1;
          graphic.scale.set(node.baseId === anchor ? 1.45 : activePath.has(node.baseId) ? 1.22 : 1);
        }

        if (label) {
          label.position.set(node.x + node.radius + 9, node.y - 8);
          label.alpha = node.baseId === anchor || activePath.has(node.baseId) ? 1 : 0.58;
          label.visible = !node.particle && (!anchor || highlighted || node.weight > 0.82);
        }
      });

      const nextFocusId = focusRef.current;

      if (nextFocusId !== lastFocusId) {
        lastFocusId = nextFocusId;
        focusNode(nextFocusId);
      }
    }

    async function setup() {
      await app.init({
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        resizeTo: targetEl,
        resolution: window.devicePixelRatio || 1
      });

      const canvas = app.canvas as HTMLCanvasElement | undefined;
      canvasEl = canvas ?? null;

      if (cancelled) {
        try {
          app.destroy(false, { children: true, texture: true });
        } catch {
          // Pixi can be partially initialized if React tears down during init.
        }
        return;
      }

      if (!canvas) {
        return;
      }

      targetEl.appendChild(canvas);
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      world.addChild(glowLayer, edgeLayer, nodeLayer, labelLayer);
      app.stage.addChild(world);

      displayNodes.forEach((node) => {
        const graphic = new Graphics();
        const color = TYPE_COLORS[node.type];

        graphic.circle(0, 0, node.radius).fill({ color, alpha: node.particle ? 0.92 : 1 });
        graphic.stroke({ color: 0xffffff, alpha: node.particle ? 0.12 : 0.22, width: node.particle ? 0.35 : 1.2 });
        graphic.eventMode = node.particle ? "none" : "static";
        graphic.cursor = node.particle ? "default" : "pointer";

        if (!node.particle) {
          graphic.on("pointerover", () => setHoveredId(node.baseId));
          graphic.on("pointerout", () => setHoveredId(null));
          graphic.on("pointerdown", (event: FederatedPointerEvent) => {
            draggedNode = node;
            node.fixed = true;
            energy = 0.7;
            setSelectedId(node.baseId);
            setFocusId(node.baseId);
            void postGraphNodeSignal(node);
            event.stopPropagation();
          });
        }

        nodeGraphics.set(node.id, graphic);
        nodeLayer.addChild(graphic);

        if (!node.particle) {
          const label = new Text({
            text: node.label,
            style: {
              fill: "#f4f5ef",
              fontFamily: "Satoshi, Geist, Arial, sans-serif",
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 0.2
            }
          });

          label.resolution = 2;
          labelGraphics.set(node.id, label);
          labelLayer.addChild(label);
        }
      });

      app.stage.on("pointerdown", (event: FederatedPointerEvent) => {
        if (draggedNode) {
          return;
        }

        isPanning = true;
        lastPoint = { x: event.global.x, y: event.global.y };
      });

      app.stage.on("pointermove", (event: FederatedPointerEvent) => {
        if (draggedNode) {
          const local = world.toLocal(event.global);
          draggedNode.x = local.x;
          draggedNode.y = local.y;
          draggedNode.vx = 0;
          draggedNode.vy = 0;
          return;
        }

        if (isPanning) {
          const dx = event.global.x - lastPoint.x;
          const dy = event.global.y - lastPoint.y;
          camera.x += dx;
          camera.y += dy;
          lastPoint = { x: event.global.x, y: event.global.y };
          applyCamera();
        }
      });

      app.stage.on("pointerup", () => {
        if (draggedNode) {
          draggedNode.fixed = false;
          draggedNode = null;
          energy = 0.35;
        }

        isPanning = false;
      });

      app.stage.on("pointerupoutside", () => {
        if (draggedNode) {
          draggedNode.fixed = false;
          draggedNode = null;
        }

        isPanning = false;
      });

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        const oldScale = camera.scale;
        const nextScale = clamp(oldScale * (event.deltaY > 0 ? 0.9 : 1.1), 0.28, 2.4);
        const worldX = (mx - app.screen.width / 2 - camera.x) / oldScale;
        const worldY = (my - app.screen.height / 2 - camera.y) / oldScale;

        camera.scale = nextScale;
        camera.x = mx - app.screen.width / 2 - worldX * nextScale;
        camera.y = my - app.screen.height / 2 - worldY * nextScale;
        applyCamera();
      };

      canvas.addEventListener("wheel", onWheel, { passive: false });
      fitView();
      app.ticker.add(draw);

      return () => {
        canvas.removeEventListener("wheel", onWheel);
      };
    }

    let removeWheel: (() => void) | undefined;
    setup().then((cleanup) => {
      removeWheel = cleanup;
    }).catch(() => {
      // React Fast Refresh can cancel Pixi initialization before the renderer exists.
    });

    return () => {
      cancelled = true;
      removeWheel?.();
      try {
        app.ticker?.remove(draw);
      } catch {
        // The ticker may not exist if cleanup runs before app.init resolves.
      }

      if (canvasEl?.parentNode) {
        canvasEl.parentNode.removeChild(canvasEl);
      }

      try {
        app.cancelResize?.();
      } catch {
        // Pixi's resize plugin can be half-torn-down during Next Fast Refresh.
      }

      try {
        app.destroy(false, { children: true, texture: true });
      } catch {
        // Avoid surfacing Pixi cleanup races as app runtime crashes.
      }
    };
  }, [activeTypes, edges, nodes, paths]);

  function toggleType(type: GraphType) {
    setActiveTypes((current) => {
      const next = new Set(current);

      if (next.has(type) && next.size > 1) {
        next.delete(type);
      } else {
        next.add(type);
      }

      return next;
    });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return;
    }

    const match = nodes.find(
      (node) =>
        activeTypes.has(node.type) &&
        (node.label.toLowerCase().includes(normalizedQuery) ||
          node.summary.toLowerCase().includes(normalizedQuery) ||
          node.group.toLowerCase().includes(normalizedQuery))
    );

    if (match) {
      setSelectedId(match.id);
      setFocusId(match.id);
      setActivePathId(null);
    }
  }

  function focusPath(path: GraphPath) {
    const finalNode = path.nodeIds[path.nodeIds.length - 1];

    setActivePathId(path.id);
    setSelectedId(finalNode);
    setFocusId(finalNode);
  }

  return (
    <div className={compact ? "interactive-graph-shell compact-graph" : "interactive-graph-shell"}>
      {!compact ? (
        <>
          <div className="graph-toolbar" aria-label="Graph controls">
            <form className="graph-search" onSubmit={handleSearch}>
              <Search size={16} />
              <label className="sr-only" htmlFor="graph-search">
                Search graph
              </label>
              <input
                id="graph-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Focus node, claim, paper..."
                type="search"
                value={query}
              />
            </form>
            <div className="graph-tools">
              <button className="button icon" onClick={() => setFocusId(selectedId ?? "thesis")} title="Focus selected" type="button">
                <LocateFixed size={16} />
              </button>
              <button className="button icon" onClick={() => { cameraCommandRef.current = "zoomOut"; }} title="Zoom out" type="button">
                <ZoomOut size={16} />
              </button>
              <button className="button icon" onClick={() => { cameraCommandRef.current = "zoomIn"; }} title="Zoom in" type="button">
                <ZoomIn size={16} />
              </button>
              <button className="button" onClick={() => { cameraCommandRef.current = "fit"; }} type="button">
                Fit
              </button>
            </div>
          </div>

          <div className="graph-type-row" aria-label="Graph type filters">
            <span className="graph-filter-label">
              <Filter size={14} />
              Filters
            </span>
            {TYPE_ORDER.map((type) => (
              <button
                className={activeTypes.has(type) ? `graph-filter ${type} active` : `graph-filter ${type}`}
                key={type}
                onClick={() => toggleType(type)}
                type="button"
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="graph-canvas-wrap">
        <div className="graph-canvas" ref={containerRef} />
        {!compact ? (
          <aside className="graph-inspector" aria-live="polite">
            {selectedNode ? (
              <>
                <p className="eyebrow">{selectedNode.type}</p>
                <h3>{selectedNode.label}</h3>
                <p className="body-copy">{selectedNode.summary}</p>
                <div className="graph-inspector-meta">
                  <span>{selectedNode.group}</span>
                  <span>{Math.round(selectedNode.weight * 100)} weight</span>
                </div>
                <div className="graph-edge-list">
                  {selectedEdges.map((edge) => (
                    <div className="graph-edge-card" key={edge.id}>
                      <strong>{edge.relation}</strong>
                      <span>{edge.evidence}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">No selection</p>
                <h3>Select a node</h3>
                <p className="body-copy">Click any hub to inspect its evidence, connected claims, and graph path.</p>
              </>
            )}
          </aside>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="graph-paths" aria-label="Demo paths">
            {paths.map((path) => (
              <button
                className={activePathId === path.id ? "graph-path active" : "graph-path"}
                key={path.id}
                onClick={() => focusPath(path)}
                type="button"
              >
                <strong>{path.label}</strong>
                <span>{path.nodeIds.join(" -> ")}</span>
              </button>
            ))}
          </div>

          <div className="graph-hint">Wheel to zoom. Drag the canvas to pan. Drag hub nodes to reshape the map.</div>
        </>
      ) : null}
    </div>
  );
}
