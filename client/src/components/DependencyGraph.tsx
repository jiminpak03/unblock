import { useEffect, useState, useCallback } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, type Node, type Edge } from "@xyflow/react";
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

function DependencyGraph({ token, boardId, onNodeClick }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/board/${boardId}/graph`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: { nodes: GraphCard[]; edges: GraphEdgeData[] }) => {
        const rawNodes: Node[] = (data.nodes ?? []).map((c) => ({
          id: String(c.id),
          position: { x: 0, y: 0 },
          data: { label: c.title },
          style: {
            border: c.isComplete ? "2px solid #22C55E" : "2px solid #6366F1",
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
            background: "white",
          },
        }));

        const rawEdges: Edge[] = (data.edges ?? []).map((e) => ({
          id: `${e.dependsOnCardId}-${e.cardId}`,
          source: String(e.dependsOnCardId),
          target: String(e.cardId),
        }));

        setNodes(getLayoutedElements(rawNodes, rawEdges));
        setEdges(rawEdges);
      })
      .catch(console.error);
  }, [boardId, token]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onNodeClick(Number(node.id)),
    [onNodeClick],
  );

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