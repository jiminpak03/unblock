import React, { useState, useEffect, useCallback } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate, useParams } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";
import type { Board, Column, Card, Category, Member } from "../types/board";
import DependencyGraph from "./DependencyGraph";
import BoardColumnCard from "./BoardColumnCard";
import BoardMembers from "./BoardMembers";
import BoardCategories from "./BoardCategories";
import CardDetailModal from "./CardDetailModal";
import useBoardSocket from "../hooks/useBoardSocket";

const POLL_INTERVAL_MS = 25000;

interface BoardViewProps {
  token: string;
  user: UserWithoutPassword;
}

function BoardView({ token, user }: BoardViewProps) {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unblockedIds, setUnblockedIds] = useState<number[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [targetColumnId, setTargetColumnId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<"list" | "graph">("graph");
  const [graphVersion, setGraphVersion] = useState(0);
  const [newColumnName, setNewColumnName] = useState("");

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const myRole = members.find((m) => m.userId === user.id)?.role;
  const isOwner = myRole === "OWNER";
  const canEdit = myRole === "EDITOR" || myRole === "OWNER";

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;
  const readyCards = cards.filter(
    (c) => unblockedIds.includes(c.id) && !c.isComplete,
  );

  const loadBoardData = useCallback(() => {
    if (!boardId) return;

    const boardPromise = fetch(`http://localhost:8080/api/board/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data: Board) => setBoard(data));

      const columnsPromise = fetch(
        `http://localhost:8080/api/board/${boardId}/column`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
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

      const categoriesPromise = fetch(
        `http://localhost:8080/api/board/${boardId}/category`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data: Category[]) =>
          setCategories(Array.isArray(data) ? data : []),
        );

      const membersPromise = fetch(
        `http://localhost:8080/api/board/${boardId}/member`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data: Member[]) => setMembers(Array.isArray(data) ? data : []));

      const unblockedPromise = fetch(
        `http://localhost:8080/api/board/${boardId}/unblocked`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((ids: number[]) =>
          setUnblockedIds(Array.isArray(ids) ? ids : []),
        );

      Promise.all([
        boardPromise,
        columnsPromise,
        categoriesPromise,
        membersPromise,
        unblockedPromise,
      ]).then(() => setIsLoading(false));
  }, [boardId, token]);

  useEffect(() => {
    loadBoardData();
    const intervalId = setInterval(loadBoardData, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [loadBoardData]);

  const handleBoardChanged = useCallback(() => {
    loadBoardData();
    setGraphVersion((v) => v + 1);
  }, [loadBoardData]);

  useBoardSocket(token, boardId, handleBoardChanged);

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

  async function handleAddColumn(event: React.SubmitEvent<HTMLFormElement>) {
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

  async function handleDeleteBoard() {
    if (!boardId) return;
    if (
      !window.confirm(
        "Permanently delete this board? This will delete all its columns, cards, dependencies, and categories.",
      )
    ) {
      return;
    }

    const response = await fetch(`http://localhost:8080/api/board/${boardId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      navigate("/");
    }
  }

  async function handleInviteMember(
    username: string,
    role: string,
  ): Promise<boolean> {
    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, role }),
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
      return true;
    } else {
      const errors = await response.json();
      alert(errors[0] ?? "Could not invite member.");
      return false;
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

  async function handleAddCard(event: React.SubmitEvent<HTMLFormElement>) {
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
    refreshUnblocked();
    setGraphVersion((v) => v + 1);
  }
}

  async function handleAddDependency(
    cardId: number,
    dependsOnCardId: number,
  ): Promise<boolean> {
    if (!dependsOnCardId) return false;

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
      return true;
    } else {
      const errors = await response.json();
      alert(errors[0] ?? "Could not add dependency.");
      return false;
    }
  }

  async function handleRemoveDependency(
    cardId: number,
    dependsOnCardId: number,
  ): Promise<boolean> {
    const response = await fetch(
      `http://localhost:8080/api/card/${cardId}/dependency/${dependsOnCardId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      notifyChanged();
      return true;
    }
    return false;
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const card = cards.find((c) => c.id === Number(active.id));
    const newColumnId = Number(over.id);
    if (!card || card.columnId === newColumnId) return;

    handleMoveCard(card, newColumnId);
  }

  async function handleDeleteCard(id: number) {
    const card = cards.find((c) => c.id === id);
    if (
      !window.confirm(
        `Delete "${card?.title ?? "this card"}"? This cannot be undone.`,
      )
    ) {
      return;
    }

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

  async function handleSaveCardDetails(
    card: Card,
    title: string,
    description: string,
    categoryId: number | null,
  ) {
    const updated = { ...card, title, description, categoryId };

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

  async function handleAddCategory(
    name: string,
    color: string,
  ): Promise<boolean> {
    if (!name || !boardId) return false;

    const response = await fetch(
      `http://localhost:8080/api/board/${boardId}/category`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, color }),
      },
    );

    if (response.ok) {
      const created: Category = await response.json();
      setCategories([...categories, created]);
      return true;
    }
    return false;
  }

  async function handleUpdateCategory(
    category: Category,
    name: string,
    color: string,
  ): Promise<boolean> {
    const updated = { ...category, name, color };

    const response = await fetch(
      `http://localhost:8080/api/board/category/${category.id}`,
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
      setCategories(
        categories.map((c) => (c.id === category.id ? updated : c)),
      );
      return true;
    }
    return false;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {isLoading ? (
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        ) : (
          <h1 className="text-2xl font-bold">{board?.name ?? "Board"}</h1>
        )}
        {!isLoading && isOwner && (
          <button
            onClick={handleDeleteBoard}
            className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5"
          >
            Delete board
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-4 mt-1.5" />
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          {members.length} member{members.length === 1 ? "" : "s"} ·{" "}
          {cards.length} card{cards.length === 1 ? "" : "s"}
          {myRole && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 align-middle">
              {myRole}
            </span>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="h-8 w-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading board…</p>
        </div>
      ) : (
        <>
          <BoardMembers
            members={members}
            currentUserId={user.id}
            isOwner={isOwner}
            onRemoveMember={handleRemoveMember}
            onInviteMember={handleInviteMember}
            onChangeRole={handleChangeRole}
          />

          <BoardCategories
            categories={categories}
            canEdit={canEdit}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />

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
                canEdit={canEdit}
                onNodeClick={(cardId) => setSelectedCardId(cardId)}
                onAddDependency={handleAddDependency}
              />
            )
          ) : (
            <>
              <div className="mb-6 border rounded-lg p-4 bg-indigo-50">
                <h2 className="font-semibold mb-2">
                  Ready to work on right now
                </h2>
                {readyCards.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nothing unblocked right now.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {readyCards.map((c) => (
                      <li key={c.id} className="text-sm">
                        {c.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canEdit && (
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
              )}

              {canEdit && (
                <form onSubmit={handleAddColumn} className="flex gap-2 mb-6">
                  <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New column name"
                    className="border rounded-lg px-3 py-2 flex-1"
                  />
                  <button
                    type="submit"
                    className="bg-gray-700 text-white rounded-lg px-4 py-2"
                  >
                    Add column
                  </button>
                </form>
              )}

              <DndContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto">
                  {columns.map((col) => (
                    <BoardColumnCard
                      key={col.id}
                      column={col}
                      columns={columns}
                      cards={cards}
                      categories={categories}
                      unblockedIds={unblockedIds}
                      canEdit={canEdit}
                      onRenameColumn={handleRenameColumn}
                      onDeleteColumn={handleDeleteColumn}
                      onToggleComplete={toggleComplete}
                      onSelectCard={(cardId) => setSelectedCardId(cardId)}
                      onDeleteCard={handleDeleteCard}
                      onAddDependency={handleAddDependency}
                      onMoveCard={handleMoveCard}
                    />
                  ))}
                </div>
              </DndContext>
            </>
          )}
        </>
      )}

      {/* Expanded card view */}
      {selectedCard && (
        <CardDetailModal
          key={selectedCard.id}
          card={selectedCard}
          cards={cards}
          categories={categories}
          canEdit={canEdit}
          token={token}
          onClose={() => setSelectedCardId(null)}
          onToggleComplete={toggleComplete}
          onSave={handleSaveCardDetails}
          onDelete={handleDeleteCard}
          onAddDependency={handleAddDependency}
          onRemoveDependency={handleRemoveDependency}
        />
      )}
    </div>
  );
}

export default BoardView;
