import type { GraphEdge, GraphNode } from "@/lib/mock-data";

type GraphPoint = GraphNode & {
  hub?: boolean;
  size: number;
};

function lineBetween(from: Pick<GraphNode, "x" | "y">, to: Pick<GraphNode, "x" | "y">) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`
  };
}

function clamp(value: number, min = 4, max = 96) {
  return Math.min(max, Math.max(min, value));
}

function clusterSize(type: GraphNode["type"]) {
  switch (type) {
    case "thesis":
      return 46;
    case "paper":
      return 34;
    case "method":
      return 28;
    case "descriptor":
      return 26;
    case "claim":
      return 24;
    default:
      return 18;
  }
}

function createClusterPoints(nodes: GraphNode[]) {
  return nodes.flatMap((node, nodeIndex) => {
    const count = clusterSize(node.type);

    return Array.from({ length: count }, (_, index) => {
      const seed = (nodeIndex + 1) * 97 + index * 31;
      const angle = (seed * 137.508) % 360;
      const radius = 3 + ((seed * 17) % 18);
      const eccentricity = 0.62 + ((seed % 9) / 20);
      const radians = angle * (Math.PI / 180);
      const x = clamp(node.x + Math.cos(radians) * radius * eccentricity);
      const y = clamp(node.y + Math.sin(radians) * radius);

      return {
        ...node,
        id: `${node.id}-particle-${index}`,
        label: node.label,
        x,
        y,
        hub: false,
        size: 2 + (seed % 4)
      };
    });
  });
}

export function KnowledgeGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const hubNodes: GraphPoint[] = nodes.map((node) => ({
    ...node,
    hub: true,
    size: node.type === "thesis" ? 15 : node.type === "paper" ? 11 : 9
  }));
  const clusterPoints = createClusterPoints(nodes);
  const graphPoints = [...clusterPoints, ...hubNodes];
  const byId = new Map(hubNodes.map((node) => [node.id, node]));

  const localEdges = clusterPoints.flatMap((point, index) => {
    const hub = byId.get(point.id.replace(/-particle-\d+$/, ""));
    const sibling = clusterPoints[index + 1];
    const result = hub ? [{ id: `${point.id}-hub`, from: point, to: hub }] : [];

    if (sibling && sibling.type === point.type && index % 3 === 0) {
      result.push({ id: `${point.id}-sibling`, from: point, to: sibling });
    }

    return result;
  });

  return (
    <div className="graph-stage obsidian-graph" aria-label="Obsidian-style knowledge graph">
      {localEdges.map((edge) => (
        <span aria-hidden className="edge web-edge" key={edge.id} style={lineBetween(edge.from, edge.to)} />
      ))}
      {edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);

        if (!from || !to) {
          return null;
        }

        return <span aria-hidden className="edge path-edge" key={edge.id} style={lineBetween(from, to)} title={edge.relation} />;
      })}
      {graphPoints.map((node) => (
        <span
          className={`node obsidian-node ${node.hub ? "hub-node" : "particle-node"} ${node.type}`}
          key={node.id}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            width: `${node.size}px`,
            height: `${node.size}px`
          }}
          title={node.label}
        >
          {node.hub ? <span>{node.label}</span> : null}
        </span>
      ))}
    </div>
  );
}
