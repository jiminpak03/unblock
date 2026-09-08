import { useState } from "react";
import type { Card, Category, Column } from "../types/board";
import CardTile from "./CardTile";

interface BoardColumnCardProps {
  column: Column;
  columns: Column[];
  cards: Card[];
  categories: Category[];
  unblockedIds: number[];
  onRenameColumn: (column: Column, newName: string) => void;
  onDeleteColumn: (id: number) => void;
  onToggleComplete: (card: Card) => void;
  onSelectCard: (cardId: number) => void;
  onDeleteCard: (id: number) => void;
  onAddDependency: (
    cardId: number,
    dependsOnCardId: number,
  ) => Promise<boolean>;
  onMoveCard: (card: Card, newColumnId: number) => void;
}

function BoardColumnCard({
  column,
  columns,
  cards,
  categories,
  unblockedIds,
  onRenameColumn,
  onDeleteColumn,
  onToggleComplete,
  onSelectCard,
  onDeleteCard,
  onAddDependency,
  onMoveCard,
}: BoardColumnCardProps) {
  const [name, setName] = useState(column.name);

  function handleBlur() {
    if (name && name !== column.name) {
      onRenameColumn(column, name);
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 w-64 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
        />
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="text-xs text-red-500 ml-1"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        {cards
          .filter((c) => c.columnId === column.id)
          .map((card) => (
            <CardTile
              key={card.id}
              card={card}
              cards={cards}
              columns={columns}
              categories={categories}
              unblockedIds={unblockedIds}
              onToggleComplete={onToggleComplete}
              onSelectCard={onSelectCard}
              onDeleteCard={onDeleteCard}
              onAddDependency={onAddDependency}
              onMoveCard={onMoveCard}
            />
          ))}
      </div>
    </div>
  );
}

export default BoardColumnCard;
