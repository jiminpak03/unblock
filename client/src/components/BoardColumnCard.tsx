import { useState } from "react";
import type { Card, Category, Column } from "../types/board";
import CardTile from "./CardTile";

interface BoardColumnCardProps {
  column: Column;
  columns: Column[];
  cards: Card[];
  categories: Category[];
  unblockedIds: number[];
  canEdit: boolean;
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
  canEdit,
  onRenameColumn,
  onDeleteColumn,
  onToggleComplete,
  onSelectCard,
  onDeleteCard,
  onAddDependency,
  onMoveCard,
}: BoardColumnCardProps) {
  const [name, setName] = useState(column.name);
  const columnCards = cards.filter((c) => c.columnId === column.id);

  function handleBlur() {
    if (name && name !== column.name) {
      onRenameColumn(column, name);
    }
  }

  function handleDeleteColumn() {
    if (
      window.confirm(
        `Delete the "${column.name}" column? Its cards will also be deleted.`,
      )
    ) {
      onDeleteColumn(column.id);
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 w-64 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          disabled={!canEdit}
        />
        <span className="text-xs text-gray-400 ml-2 shrink-0">
          {columnCards.length}
        </span>
        {canEdit && (
          <button
            onClick={handleDeleteColumn}
            className="text-xs text-red-500 ml-1"
          >
            ✕
          </button>
        )}
      </div>
      <div className="space-y-2">
        {columnCards.length === 0 && (
          <p className="text-xs text-gray-400 italic">No cards yet.</p>
        )}
        {columnCards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            cards={cards}
            columns={columns}
            categories={categories}
            unblockedIds={unblockedIds}
            canEdit={canEdit}
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
