import { useState } from "react";
import type { Category } from "../types/board";

interface BoardCategoriesProps {
  categories: Category[];
  canEdit: boolean;
  onAddCategory: (name: string, color: string) => Promise<boolean>;
  onUpdateCategory: (
    category: Category,
    name: string,
    color: string,
  ) => Promise<boolean>;
  onDeleteCategory: (id: number) => void;
}

function BoardCategories({
  categories,
  canEdit,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: BoardCategoriesProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8b5cf6");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#8b5cf6");

  async function handleAddCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCategoryName) return;

    const ok = await onAddCategory(newCategoryName, newCategoryColor);
    if (ok) {
      setNewCategoryName("");
    }
  }

  function startEditing(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cat = categories.find((c) => c.id === editingId);
    if (!cat || !editName) return;

    const ok = await onUpdateCategory(cat, editName, editColor);
    if (ok) {
      setEditingId(null);
    }
  }

  function handleDeleteCategory(cat: Category) {
    if (window.confirm(`Delete the "${cat.name}" category?`)) {
      onDeleteCategory(cat.id);
    }
  }

  return (
    <div className="mb-6">
      <h2 className="font-semibold text-sm mb-2">Categories</h2>
      {categories.length === 0 && (
        <p className="text-sm text-gray-400 mb-2">
          No categories yet. Add one to start grouping cards.
        </p>
      )}
      <div className="flex gap-2 mb-2 flex-wrap">
        {categories.map((cat) =>
          editingId === cat.id ? (
            <form
              key={cat.id}
              onSubmit={handleSaveEdit}
              className="flex items-center gap-1 bg-gray-100 rounded-full pl-1.5 pr-2 py-1"
            >
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-5 h-5 border-0 bg-transparent p-0"
              />
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="text-xs border rounded px-1 py-0.5 w-24"
              />
              <button type="submit" className="text-xs text-indigo-600">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
            </form>
          ) : (
            <span
              key={cat.id}
              className="text-xs bg-gray-100 rounded-full px-2 py-1 flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
              {canEdit && (
                <>
                  <button
                    onClick={() => startEditing(cat)}
                    className="text-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </>
              )}
            </span>
          ),
        )}
      </div>
      {canEdit && (
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="border rounded-lg px-2 py-1 text-sm flex-1"
          />
          <input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className="w-10 h-8 border rounded"
          />
          <button type="submit" className="text-sm bg-gray-200 rounded-lg px-3">
            Add
          </button>
        </form>
      )}
    </div>
  );
}

export default BoardCategories;
