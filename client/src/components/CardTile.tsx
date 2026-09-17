import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Card, Category, Column } from "../types/board";

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
      className={`bg-white border rounded-lg p-3 space-y-2 ${
        isBlocked ? "border-rose-300 bg-rose-50/60" : ""
      } ${isDragging ? "opacity-50" : ""}`}
    >
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
