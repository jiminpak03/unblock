import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";
import DependencyGraph from "./DependencyGraph";

interface Column {
  id: number;
  boardId: number;
  name: string;
  position: number;
}

interface Card {
  id: number;
  columnId: number;
  categoryId: number | null;
  title: string;
  description: string;
  isComplete: boolean;
  position: number;
}

interface Category {
  id: number;
  boardId: number;
  name: string;
  color: string;
}

interface Member {
  userId: number;
  username: string;
  role: string;
}

interface BoardViewProps {
  token: string;
  user: UserWithoutPassword;
}

function BoardView({ token, user }: BoardViewProps) {
  const { boardId } = useParams();
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unblockedIds, setUnblockedIds] = useState<number[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [targetColumnId, setTargetColumnId] = useState<number | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ [cardId: number]: string }>(
    {},
  );
  const [dependencyTarget, setDependencyTarget] = useState<{
    [cardId: number]: string;
  }>({});
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [targetRole, setTargetRole] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<"list" | "graph">("list");
  const [graphVersion, setGraphVersion] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8b5cf6");
  const [newColumnName, setNewColumnName] = useState("");

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [cardDependencyIds, setCardDependencyIds] = useState<number[]>([]);
  const [columnEdits, setColumnEdits] = useState<{ [id: number]: string }>({});

  const myRole = members.find((m) => m.userId === user.id)?.role;
  const isOwner = myRole === "OWNER";

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  useEffect(() => {
    if (!boardId) return;

    fetch(`http://localhost:8080/api/board/${boardId}/column`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (columnData: Column[]) => {
        setColumns(columnData);

        const allCards: Card[] = [];
        for (const col of columnData) {
          const res = await fetch(
            `http://localhost:8080/api/card/column/${col.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const cardData: Card[] = await res.json();
          allCards.push(...cardData);
        }
        setCards(allCards);
      });

    fetch(`http://localhost:8080/api/board/${boardId}/category`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Category[]) =>
        setCategories(Array.isArray(data) ? data : []),
      );

    fetch(`http://localhost:8080/api/board/${boardId}/member`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Member[]) => setMembers(Array.isArray(data) ? data : []));

    fetch(`http://localhost:8080/api/board/${boardId}/unblocked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids: number[]) => setUnblockedIds(Array.isArray(ids) ? ids : []));
  }, [boardId, token]);

  useEffect(() => {
    if (!selectedCard) return;
    setEditTitle(selectedCard.title);
    setEditDescription(selectedCard.description ?? "");

    fetch(`http://localhost:8080/api/card/${selectedCard.id}/dependency`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids: number[]) =>
        setCardDependencyIds(Array.isArray(ids) ? ids : []),
      )
      .catch(() => setCardDependencyIds([]));
  }, [selectedCardId]);

  function refreshUnblocked() {
    fetch(`http://localhost:8080/api/board/${boardId}/unblocked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids: number[]) => setUnblockedIds(Array.isArray(ids) ? ids : []));
  }

  function notifyChanged() {
    refreshUnblocked();
    setGraphVersion((v) => v + 1);
  }

  async function handleAddColumn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newColumnName || !boardId) return;

    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/column`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newColumnName, position: columns.length }),
      },
    );

    if (response.ok) {
      const created: Column = await response.json();
      setColumns([...columns, created]);
      setNewColumnName("");
    }
  }

  async function handleInviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usernameToInvite || !targetRole) return;

    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameToInvite, role: targetRole }),
      },
    );

    if (response.ok) {
      const updated = await fetch(
        `http://localhost:8080/api/board/${boardId}/member`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ).then((res) => res.json());
      setMembers(updated);
      setUsernameToInvite("");
      setTargetRole(null);
    } else {
      const errors = await response.json();
      alert(errors[0] ?? "Could not invite member.");
    }
  }

  async function handleRemoveMember(userId: number) {
    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/member/${userId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      setMembers(members.filter((m) => m.userId !== userId));
    }
  }

  async function handleAddCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (targetColumnId === null) return;

    const response = await fetch("http://localhost:8080/api/card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ columnId: targetColumnId, title: newCardTitle }),
    });

    if (response.ok) {
      const created: Card = await response.json();
      setCards([...cards, created]);
      setNewCardTitle("");
      setGraphVersion((v) => v + 1);
    }
  }

  async function handleAddDependency(cardId: number) {
    const dependsOnCardId = Number(dependencyTarget[cardId]);
    if (!dependsOnCardId) return;

    const response = await fetch(
      `http://localhost:8080/api/card/${cardId}/dependency`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dependsOnCardId }),
      },
    );

    if (response.ok) {
      notifyChanged();
      setDependencyTarget({ ...dependencyTarget, [cardId]: "" });
      if (selectedCardId === cardId) {
        setCardDependencyIds([...cardDependencyIds, dependsOnCardId]);
      }
    } else {
      const errors = await response.json();
      alert(errors[0] ?? "Could not add dependency.");
    }
  }

  async function handleRemoveDependency(
    cardId: number,
    dependsOnCardId: number,
  ) {
    const response = await fetch(
      `http://localhost:8080/api/card/${cardId}/dependency/${dependsOnCardId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      setCardDependencyIds(
        cardDependencyIds.filter((id) => id !== dependsOnCardId),
      );
      notifyChanged();
    }
  }

  async function handleMoveCard(card: Card, newColumnId: number) {
    const updated = { ...card, columnId: newColumnId };

    const response = await fetch(`http://localhost:8080/api/card/${card.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });

    if (response.ok) {
      setCards(cards.map((c) => (c.id === card.id ? updated : c)));
      notifyChanged();
    }
  }

  async function handleDeleteCard(id: number) {
    const response = await fetch(`http://localhost:8080/api/card/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setCards(cards.filter((c) => c.id !== id));
      if (selectedCardId === id) setSelectedCardId(null);
      notifyChanged();
    }
  }

  async function toggleComplete(card: Card) {
    const updated = { ...card, isComplete: !card.isComplete };

    const response = await fetch(`http://localhost:8080/api/card/${card.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });

    if (response.ok) {
      setCards(cards.map((c) => (c.id === card.id ? updated : c)));
      notifyChanged();
    }
  }

  async function handleSaveCardDetails() {
    if (!selectedCard) return;
    const updated = {
      ...selectedCard,
      title: editTitle,
      description: editDescription,
    };

    const response = await fetch(
      `http://localhost:8080/api/card/${selectedCard.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      },
    );

    if (response.ok) {
      setCards(cards.map((c) => (c.id === selectedCard.id ? updated : c)));
      setSelectedCardId(null);
      setGraphVersion((v) => v + 1);
    }
  }

  async function handleRenameColumn(column: Column, newName: string) {
    const response = await fetch(
      `http://localhost:8080/api/board/column/${column.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...column, name: newName }),
      },
    );

    if (response.ok) {
      setColumns(
        columns.map((c) => (c.id === column.id ? { ...c, name: newName } : c)),
      );
    }
  }

  async function handleDeleteColumn(id: number) {
    const response = await fetch(
      `http://localhost:8080/api/board/column/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      setColumns(columns.filter((c) => c.id !== id));
      setCards(cards.filter((c) => c.columnId !== id));
    }
  }

  async function handleAddCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCategoryName || !boardId) return;

    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/category`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor,
        }),
      },
    );

    if (response.ok) {
      const created: Category = await response.json();
      setCategories([...categories, created]);
      setNewCategoryName("");
    }
  }

  async function handleDeleteCategory(id: number) {
    const response = await fetch(
      `http://localhost:8080/api/board/category/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  async function handleChangeRole(userId: number, role: string) {
    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/member/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: "", role }),
      },
    );

    if (response.ok) {
      setMembers(
        members.map((m) => (m.userId === userId ? { ...m, role } : m)),
      );
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Board</h1>

      {/* Members */}
      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">Members</h2>
        <ul className="text-sm space-y-1 mb-4">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex justify-between max-w-xs items-center"
            >
              <span>{m.username}</span>
              <span className="flex items-center gap-2">
                <span className="text-gray-500">{m.role}</span>
                {isOwner && m.userId !== user.id && (
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>

        {isOwner && (
          <form onSubmit={handleInviteMember} className="flex gap-2">
            <input
              value={usernameToInvite}
              onChange={(e) => setUsernameToInvite(e.target.value)}
              placeholder="Username to invite"
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <select
              value={targetRole ?? ""}
              onChange={(e) => setTargetRole(e.target.value)}
              className="border rounded-lg px-2"
            >
              <option value="" disabled>
                Choose a role
              </option>
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="OWNER">Owner</option>
            </select>
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2"
            >
              Invite
            </button>
          </form>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">Categories</h2>
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
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
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
      </div>

      {/* View toggle */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm mb-4 w-fit">
        <button
          onClick={() => setView("graph")}
          className={`px-3 py-1.5 rounded-md ${view === "graph" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
        >
          Graph
        </button>
        <button
          onClick={() => setView("list")}
          className={`px-3 py-1.5 rounded-md ${view === "list" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
        >
          Board
        </button>
      </div>

      {view === "graph" ? (
        boardId && (
          <DependencyGraph
            token={token}
            boardId={boardId}
            refreshKey={graphVersion}
            unblockedIds={unblockedIds}
            onNodeClick={(cardId) => setSelectedCardId(cardId)}
          />
        )
      ) : (
        <>
          <div className="mb-6 border rounded-lg p-4 bg-indigo-50">
            <h2 className="font-semibold mb-2">Ready to work on right now</h2>
            <ul className="space-y-1">
              {cards
                .filter((c) => unblockedIds.includes(c.id) && !c.isComplete)
                .map((c) => (
                  <li key={c.id} className="text-sm">
                    {c.title}
                  </li>
                ))}
            </ul>
          </div>

          <form onSubmit={handleAddCard} className="flex gap-2 mb-6">
            <select
              value={targetColumnId ?? ""}
              onChange={(e) => setTargetColumnId(Number(e.target.value))}
              className="border rounded-lg px-2"
            >
              <option value="" disabled>
                Choose a column
              </option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            <input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="New card title"
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2"
            >
              Add card
            </button>
          </form>

          <div className="flex gap-4 overflow-x-auto">
            {columns.map((col) => (
              <div
                key={col.id}
                className="bg-gray-50 rounded-lg p-3 w-64 shrink-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    value={columnEdits[col.id] ?? col.name}
                    onChange={(e) =>
                      setColumnEdits({
                        ...columnEdits,
                        [col.id]: e.target.value,
                      })
                    }
                    onBlur={() => {
                      if (
                        columnEdits[col.id] &&
                        columnEdits[col.id] !== col.name
                      ) {
                        handleRenameColumn(col, columnEdits[col.id]);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleDeleteColumn(col.id)}
                    className="text-xs text-red-500 ml-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {cards
                    .filter((c) => c.columnId === col.id)
                    .map((card) => {
                      const isBlocked =
                        !unblockedIds.includes(card.id) && !card.isComplete;
                      const category = categories.find(
                        (cat) => cat.id === card.categoryId,
                      );

                      return (
                        <div
                          key={card.id}
                          id={`card-${card.id}`}
                          className="bg-white border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm flex-1">
                              <input
                                type="checkbox"
                                checked={card.isComplete}
                                disabled={isBlocked}
                                onChange={() => toggleComplete(card)}
                              />
                              {category && (
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedCardId(card.id)}
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
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-xs text-red-500"
                            >
                              ✕
                            </button>
                          </div>

                          {isBlocked && (
                            <span className="text-xs text-rose-600">
                              blocked
                            </span>
                          )}

                          <div className="flex gap-1">
                            <select
                              value={dependencyTarget[card.id] ?? ""}
                              onChange={(e) =>
                                setDependencyTarget({
                                  ...dependencyTarget,
                                  [card.id]: e.target.value,
                                })
                              }
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
                              onClick={() => handleAddDependency(card.id)}
                              className="text-xs bg-gray-200 rounded px-2"
                            >
                              +
                            </button>
                          </div>

                          <select
                            value={moveTarget[card.id] ?? String(card.columnId)}
                            onChange={(e) => {
                              const newColumnId = Number(e.target.value);
                              setMoveTarget({
                                ...moveTarget,
                                [card.id]: e.target.value,
                              });
                              handleMoveCard(card, newColumnId);
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
                    })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Expanded card view */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedCardId(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-bold w-full outline-none border-b border-transparent focus:border-gray-200"
              />
              <button
                onClick={() => setSelectedCardId(null)}
                className="text-gray-400 ml-2"
              >
                ✕
              </button>
            </div>

            <label className="flex items-center gap-2 mb-4 text-sm">
              <input
                type="checkbox"
                checked={selectedCard.isComplete}
                onChange={() => toggleComplete(selectedCard)}
              />
              Mark complete
            </label>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Blocked by
              </label>
              <div className="mt-2 space-y-1.5">
                {cardDependencyIds.length === 0 && (
                  <p className="text-xs text-gray-400">No dependencies</p>
                )}
                {cardDependencyIds.map((depId) => {
                  const dep = cards.find((c) => c.id === depId);
                  return (
                    <div
                      key={depId}
                      className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
                    >
                      <span className="text-sm">
                        {dep?.title ?? `Card ${depId}`}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveDependency(selectedCard.id, depId)
                        }
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-1 mt-2">
                <select
                  value={dependencyTarget[selectedCard.id] ?? ""}
                  onChange={(e) =>
                    setDependencyTarget({
                      ...dependencyTarget,
                      [selectedCard.id]: e.target.value,
                    })
                  }
                  className="text-xs border rounded flex-1"
                >
                  <option value="">Depends on...</option>
                  {cards
                    .filter((c) => c.id !== selectedCard.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAddDependency(selectedCard.id)}
                  className="text-xs bg-gray-200 rounded px-2"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => handleDeleteCard(selectedCard.id)}
                className="text-sm text-red-600"
              >
                Delete card
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCardDetails}
                  className="text-sm bg-indigo-600 text-white rounded-lg px-3 py-1.5"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardView;
