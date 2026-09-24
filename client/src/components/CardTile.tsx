import { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Card, Category, Column } from "../types/board";

const PARTICLE_ANGLES_DEG = [0, 60, 120, 180, 240, 300];
const PARTICLE_DISTANCE_PX = 20;

function particleOffset(angleDeg: number): React.CSSProperties {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    "--dx": `${Math.cos(rad) * PARTICLE_DISTANCE_PX}px`,
    "--dy": `${Math.sin(rad) * PARTICLE_DISTANCE_PX}px`,
  } as React.CSSProperties;
}

interface CardTileProps {
  card: Card;
  cards: Card[];
  columns: Column[];
  categories: Category[];
  unblockedIds: number[];
  canEdit: boolean;
  onToggleComplete: (card: Card) => void;
  onSelectCard: (cardId: number) => void;
  onDeleteCard: (id: number) => void;
  onAddDependency: (
    cardId: number,
    dependsOnCardId: number,
  ) => Promise<boolean>;
  onMoveCard: (card: Card, newColumnId: number) => void;
}

function CardTile({
  card,
  cards,
  columns,
  categories,
  unblockedIds,
  canEdit,
  onToggleComplete,
  onSelectCard,
  onDeleteCard,
  onAddDependency,
  onMoveCard,
}: CardTileProps) {
  const [dependencyTarget, setDependencyTarget] = useState("");
  const [moveTarget, setMoveTarget] = useState(String(card.columnId));

  const isBlocked = !unblockedIds.includes(card.id) && !card.isComplete;
  const category = categories.find((cat) => cat.id === card.categoryId);

  const wasBlockedRef = useRef(isBlocked);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    if (wasBlockedRef.current && !isBlocked && !card.isComplete) {
      setIsCelebrating(true);
    }
    wasBlockedRef.current = isBlocked;
  }, [isBlocked, card.isComplete]);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id, disabled: !canEdit });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  async function handleAddDependency() {
    const dependsOnCardId = Number(dependencyTarget);
    if (!dependsOnCardId) return;

    const ok = await onAddDependency(card.id, dependsOnCardId);
    if (ok) {
      setDependencyTarget("");
    }
  }

  return (
    <div
      id={`card-${card.id}`}
      ref={setNodeRef}
      style={dragStyle}
      className={`relative bg-white border rounded-lg p-3 space-y-2 ${
        isBlocked ? "border-rose-300 bg-rose-50/60" : ""
      } ${isDragging ? "opacity-50" : ""} ${
        isCelebrating ? "unblock-celebrate" : ""
      }`}
      onAnimationEnd={(e) => {
        if (e.currentTarget === e.target) setIsCelebrating(false);
      }}
    >
      {isCelebrating &&
        PARTICLE_ANGLES_DEG.map((angle) => (
          <span
            key={angle}
            className="unblock-particle"
            style={particleOffset(angle)}
          />
        ))}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm flex-1">
          {canEdit && (
            <span
              {...attributes}
              {...listeners}
              className="cursor-grab text-gray-300 hover:text-gray-500 select-none px-1 -mx-1 text-base leading-none"
              style={{ touchAction: "none" }}
              title="Drag to move"
            >
              ⠿
            </span>
          )}
          <input
            type="checkbox"
            checked={card.isComplete}
            disabled={isBlocked || !canEdit}
            onChange={() => onToggleComplete(card)}
          />
          {category && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          <button
            type="button"
            onClick={() => onSelectCard(card.id)}
            className={`text-left hover:underline ${
              card.isComplete
                ? "line-through text-gray-400"
                : isBlocked
                  ? "text-gray-400"
                  : ""
            }`}
          >
            {card.title}
          </button>
        </label>
        {canEdit && (
          <button
            onClick={() => onDeleteCard(card.id)}
            className="text-xs text-red-500"
          >
            ✕
          </button>
        )}
      </div>

      {isBlocked && <span className="text-xs text-rose-600">blocked</span>}

      {canEdit && (
        <div className="flex gap-1">
          <select
            value={dependencyTarget}
            onChange={(e) => setDependencyTarget(e.target.value)}
            className="text-xs border rounded flex-1 min-w-0"
          >
            <option value="">Depends on...</option>
            {cards
              .filter((c) => c.id !== card.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddDependency}
            className="text-xs bg-gray-200 rounded px-2"
          >
            +
          </button>
        </div>
      )}

      <select
        value={moveTarget}
        disabled={!canEdit}
        onChange={(e) => {
          const newColumnId = Number(e.target.value);
          setMoveTarget(e.target.value);
          onMoveCard(card, newColumnId);
        }}
        className="text-xs border rounded w-full"
      >
        {columns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CardTile;
