import { useState } from "react";
import type { Category } from "../types/board";

interface BoardCategoriesProps {
  categories: Category[];
  canEdit: boolean;
  onAddCategory: (name: string, color: string) => Promise<boolean>;
  onDeleteCategory: (id: number) => void;
}

function BoardCategories({
  categories,
  canEdit,
  onAddCategory,
  onDeleteCategory,
}: BoardCategoriesProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8b5cf6");

  async function handleAddCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCategoryName) return;

    const ok = await onAddCategory(newCategoryName, newCategoryColor);
    if (ok) {
      setNewCategoryName("");
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
        {categories.map((cat) => (
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
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-red-500"
              >
                ✕
              </button>
            )}
          </span>
        ))}
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
