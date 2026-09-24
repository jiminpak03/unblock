import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  BaseEdge,
  getBezierPath,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type EdgeProps,
  type Connection,
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
  canEdit: boolean;
  onNodeClick: (cardId: number) => void;
  onAddDependency: (
    cardId: number,
    dependsOnCardId: number,
  ) => Promise<boolean>;
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

function nodeLabel(card: GraphCard) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {card.isComplete && <CompletedBadge />}
      <span>{card.title}</span>
    </span>
  );
}

function nodeStyle(isComplete: boolean, isBlocked: boolean, isHighlighted: boolean) {
  return {
    border: isComplete
      ? "2px solid #22C55E"
      : isBlocked
        ? "2px solid #F43F5E"
        : "2px solid #6366F1",
    borderStyle: isBlocked ? "dashed" : "solid",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    background: "white",
    boxShadow: isHighlighted
      ? "0 0 0 3px rgba(99, 102, 241, 0.5), 0 4px 8px rgba(15, 23, 42, 0.15)"
      : "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 8px rgba(15, 23, 42, 0.08)",
  };
}

function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const edgeData = data as { flowing?: boolean; justConnected?: boolean } | undefined;
  const isFlowing = Boolean(edgeData?.flowing);
  const isJustConnected = Boolean(edgeData?.justConnected);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {isFlowing && (
        <path d={edgePath} fill="none" className="unblock-edge-flow" />
      )}
      {isJustConnected && (
        <path d={edgePath} fill="none" className="unblock-edge-snap" />
      )}
    </>
  );
}

const edgeTypes = { flow: FlowEdge };

function wouldCreateCycle(
  edges: Edge[],
  cardId: number,
  dependsOnCardId: number,
): boolean {
  const toCheck = [dependsOnCardId];
  const seen = new Set<number>();

  while (toCheck.length > 0) {
    const current = toCheck.shift()!;
    if (current === cardId) return true;
    if (seen.has(current)) continue;
    seen.add(current);

    edges
      .filter((e) => Number(e.target) === current)
      .forEach((e) => toCheck.push(Number(e.source)));
  }

  return false;
}

function DependencyGraphInner({
  token,
  boardId,
  refreshKey,
  unblockedIds,
  canEdit,
  onNodeClick,
  onAddDependency,
}: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [graphCards, setGraphCards] = useState<GraphCard[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectShakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousEdgeIds = useRef<Set<string> | null>(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    fetch(`http://localhost:8080/api/board/${boardId}/graph`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: { nodes: GraphCard[]; edges: GraphEdgeData[] }) => {
        const cards = data.nodes ?? [];
        setGraphCards(cards);

        const rawEdges: Edge[] = (data.edges ?? []).map((e) => ({
          id: `${e.dependsOnCardId}-${e.cardId}`,
          source: String(e.dependsOnCardId),
          target: String(e.cardId),
          type: "flow",
          data: { flowing: false, justConnected: false },
        }));

        const newEdgeIds = previousEdgeIds.current
          ? rawEdges
              .map((e) => e.id)
              .filter((id) => !previousEdgeIds.current!.has(id))
          : [];
        previousEdgeIds.current = new Set(rawEdges.map((e) => e.id));

        if (newEdgeIds.length > 0) {
          rawEdges.forEach((e) => {
            if (newEdgeIds.includes(e.id)) {
              e.data = { ...e.data, justConnected: true };
            }
          });
          if (snapTimeout.current) clearTimeout(snapTimeout.current);
          snapTimeout.current = setTimeout(() => {
            setEdges((current) =>
              current.map((e) =>
                newEdgeIds.includes(e.id)
                  ? { ...e, data: { ...e.data, justConnected: false } }
                  : e,
              ),
            );
          }, 450);
        }

        const rawNodes: Node[] = cards.map((c) => ({
          id: String(c.id),
          position: { x: 0, y: 0 },
          data: { label: nodeLabel(c) },
          style: nodeStyle(c.isComplete, false, false),
        }));

        setNodes(getLayoutedElements(rawNodes, rawEdges));
        setEdges(rawEdges);
        setHasLoaded(true);
      })
      .catch(console.error);
  }, [boardId, token, refreshKey, setNodes, setEdges]);

  const unblockedKey = [...unblockedIds].sort((a, b) => a - b).join(",");
  useEffect(() => {
    setNodes((current) =>
      current.map((n) => {
        const card = graphCards.find((c) => String(c.id) === n.id);
        if (!card) return n;
        const isBlocked =
          !unblockedIds.includes(card.id) && !card.isComplete;
        return {
          ...n,
          data: { label: nodeLabel(card) },
          style: nodeStyle(card.isComplete, isBlocked, n.id === String(highlightedId)),
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unblockedKey, graphCards, highlightedId, setNodes]);

  useEffect(() => {
    setEdges((current) =>
      current.map((e) => {
        const sourceCard = graphCards.find((c) => String(c.id) === e.source);
        const targetCard = graphCards.find((c) => String(c.id) === e.target);
        const targetBlocked =
          !!targetCard &&
          !targetCard.isComplete &&
          !unblockedIds.includes(targetCard.id);
        const flowing = !!sourceCard?.isComplete && targetBlocked;
        return { ...e, data: { ...e.data, flowing } };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unblockedKey, graphCards, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onNodeClick(Number(node.id)),
    [onNodeClick],
  );

  const flashRejected = useCallback(
    (nodeIds: string[]) => {
      setNodes((current) =>
        current.map((n) =>
          nodeIds.includes(n.id) ? { ...n, className: "unblock-reject-shake" } : n,
        ),
      );
      if (rejectShakeTimeout.current) clearTimeout(rejectShakeTimeout.current);
      rejectShakeTimeout.current = setTimeout(() => {
        setNodes((current) =>
          current.map((n) =>
            nodeIds.includes(n.id) ? { ...n, className: undefined } : n,
          ),
        );
      }, 450);
    },
    [setNodes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const isInvalid =
        source === target ||
        wouldCreateCycle(edges, Number(target), Number(source));

      if (isInvalid) {
        flashRejected([source, target]);
        return;
      }

      onAddDependency(Number(target), Number(source));
    },
    [edges, onAddDependency, flashRejected],
  );

  const matches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return graphCards.filter((c) => c.title.toLowerCase().includes(term));
  }, [searchTerm, graphCards]);

  function focusOnCard(cardId: number) {
    fitView({ nodes: [{ id: String(cardId) }], duration: 400, maxZoom: 1.5 });
    setHighlightedId(cardId);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setHighlightedId(null), 2000);
    setSearchTerm("");
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && matches.length > 0) {
      focusOnCard(matches[0].id);
    }
  }

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
    <div>
      <div className="relative mb-2 w-64">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search cards…"
          className="border rounded-lg px-3 py-1.5 text-sm w-full"
        />
        {matches.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => focusOnCard(c.id)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50"
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ height: 500 }} className="border rounded-lg bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          nodesConnectable={canEdit}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={{
            stroke: "#6366f1",
            strokeWidth: 2.5,
            strokeDasharray: "6 6",
          }}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

function DependencyGraph(props: DependencyGraphProps) {
  return (
    <ReactFlowProvider>
      <DependencyGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default DependencyGraph;
