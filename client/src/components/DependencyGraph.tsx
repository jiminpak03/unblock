import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";

interface GraphCard {
  id: number;
  title: string;
  isComplete: boolean;
}

interface GraphEdgeData {
  cardId: number;
  dependsOnCardId: number;
}

interface DependencyGraphProps {
  token: string;
  boardId: string;
  refreshKey: number;
  unblockedIds: number[];
  onNodeClick: (cardId: number) => void;
}

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });

  nodes.forEach((n) => g.setNode(n.id, { width: 180, height: 50 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 90, y: pos.y - 25 } };
  });
}

function CompletedBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#22C55E",
        color: "white",
        fontSize: 9,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function DependencyGraph({
  token,
  boardId,
  refreshKey,
  unblockedIds,
  onNodeClick,
}: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/board/${boardId}/graph`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: { nodes: GraphCard[]; edges: GraphEdgeData[] }) => {
        const rawNodes: Node[] = (data.nodes ?? []).map((c) => {
          const isBlocked = !unblockedIds.includes(c.id) && !c.isComplete;
          return {
            id: String(c.id),
            position: { x: 0, y: 0 },
            data: {
              label: (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {c.isComplete && <CompletedBadge />}
                  <span>{c.title}</span>
                </span>
              ),
            },
            style: {
              border: c.isComplete
                ? "2px solid #22C55E"
                : isBlocked
                  ? "2px solid #F43F5E"
                  : "2px solid #6366F1",
              borderStyle: isBlocked ? "dashed" : "solid",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              background: "white",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 8px rgba(15, 23, 42, 0.08)",
            },
          };
        });

        const rawEdges: Edge[] = (data.edges ?? []).map((e) => ({
          id: `${e.dependsOnCardId}-${e.cardId}`,
          source: String(e.dependsOnCardId),
          target: String(e.cardId),
        }));

        setNodes(getLayoutedElements(rawNodes, rawEdges));
        setEdges(rawEdges);
        setHasLoaded(true);
      })
      .catch(console.error);
  }, [boardId, token, refreshKey, unblockedIds]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onNodeClick(Number(node.id)),
    [onNodeClick],
  );

  if (hasLoaded && nodes.length === 0) {
    return (
      <div
        style={{ height: 500 }}
        className="border rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400"
      >
        <p className="text-sm font-medium">No cards yet</p>
        <p className="text-xs mt-1">
          Add a card to see it show up in the dependency graph.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: 500 }} className="border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default DependencyGraph;
