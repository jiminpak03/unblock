import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";
import type { Column, Card, Category, Member } from "../types/board";
import DependencyGraph from "./DependencyGraph";
import BoardColumnCard from "./BoardColumnCard";
import BoardMembers from "./BoardMembers";
import BoardCategories from "./BoardCategories";
import CardDetailModal from "./CardDetailModal";

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
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<"list" | "graph">("list");
  const [graphVersion, setGraphVersion] = useState(0);
  const [newColumnName, setNewColumnName] = useState("");

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

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

  async function handleSaveCardDetails(
    card: Card,
    title: string,
    description: string,
  ) {
    const updated = { ...card, title, description };

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

      <BoardMembers
        members={members}
        currentUserId={user.id}
        isOwner={isOwner}
        onRemoveMember={handleRemoveMember}
        onInviteMember={handleInviteMember}
      />

      <BoardCategories
        categories={categories}
        onAddCategory={handleAddCategory}
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
              <BoardColumnCard
                key={col.id}
                column={col}
                columns={columns}
                cards={cards}
                categories={categories}
                unblockedIds={unblockedIds}
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
        </>
      )}

      {/* Expanded card view */}
      {selectedCard && (
        <CardDetailModal
          key={selectedCard.id}
          card={selectedCard}
          cards={cards}
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
