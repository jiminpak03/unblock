import { useEffect, useState } from "react";
import type { Card, Category } from "../types/board";

interface CardDetailModalProps {
  card: Card;
  cards: Card[];
  categories: Category[];
  canEdit: boolean;
  token: string;
  onClose: () => void;
  onToggleComplete: (card: Card) => void;
  onSave: (
    card: Card,
    title: string,
    description: string,
    categoryId: number | null,
  ) => void;
  onDelete: (id: number) => void;
  onAddDependency: (
    cardId: number,
    dependsOnCardId: number,
  ) => Promise<boolean>;
  onRemoveDependency: (
    cardId: number,
    dependsOnCardId: number,
  ) => Promise<boolean>;
}

function CardDetailModal({
  card,
  cards,
  categories,
  canEdit,
  token,
  onClose,
  onToggleComplete,
  onSave,
  onDelete,
  onAddDependency,
  onRemoveDependency,
}: CardDetailModalProps) {
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(
    card.description ?? "",
  );
  const [editCategoryId, setEditCategoryId] = useState<number | null>(
    card.categoryId,
  );
  const [dependencyIds, setDependencyIds] = useState<number[]>([]);
  const [dependencyTarget, setDependencyTarget] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/card/${card.id}/dependency`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids: number[]) => setDependencyIds(Array.isArray(ids) ? ids : []))
      .catch(() => setDependencyIds([]));
  }, [card.id, token]);

  async function handleAddDependency() {
    const dependsOnCardId = Number(dependencyTarget);
    if (!dependsOnCardId) return;

    const ok = await onAddDependency(card.id, dependsOnCardId);
    if (ok) {
      setDependencyIds([...dependencyIds, dependsOnCardId]);
      setDependencyTarget("");
    }
  }

  async function handleRemoveDependency(dependsOnCardId: number) {
    const ok = await onRemoveDependency(card.id, dependsOnCardId);
    if (ok) {
      setDependencyIds(dependencyIds.filter((id) => id !== dependsOnCardId));
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={!canEdit}
            className="text-lg font-bold w-full outline-none border-b border-transparent focus:border-gray-200"
          />
          <button onClick={onClose} className="text-gray-400 ml-2">
            ✕
          </button>
        </div>

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={card.isComplete}
            disabled={!canEdit}
            onChange={() => onToggleComplete(card)}
          />
          Mark complete
        </label>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Category
          </label>
          <select
            value={editCategoryId ?? ""}
            disabled={!canEdit}
            onChange={(e) =>
              setEditCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Description
          </label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            disabled={!canEdit}
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Blocked by
          </label>
          <div className="mt-2 space-y-1.5">
            {dependencyIds.length === 0 && (
              <p className="text-xs text-gray-400">No dependencies</p>
            )}
            {dependencyIds.map((depId) => {
              const dep = cards.find((c) => c.id === depId);
              return (
                <div
                  key={depId}
                  className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
                >
                  <span className="text-sm">
                    {dep?.title ?? `Card ${depId}`}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveDependency(depId)}
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {canEdit && (
            <div className="flex gap-1 mt-2">
              <select
                value={dependencyTarget}
                onChange={(e) => setDependencyTarget(e.target.value)}
                className="text-xs border rounded flex-1"
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
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-100">
          {canEdit ? (
            <button
              onClick={() => onDelete(card.id)}
              className="text-sm text-red-600"
            >
              Delete card
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={() =>
                  onSave(card, editTitle, editDescription, editCategoryId)
                }
                className="text-sm bg-indigo-600 text-white rounded-lg px-3 py-1.5"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetailModal;
