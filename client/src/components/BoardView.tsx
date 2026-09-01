import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";

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

interface BoardViewProps {
  token: string;
  user: UserWithoutPassword;
}

interface Member {
  userId: number;
  username: string;
  role: string;
}

function BoardView({ token, user }: BoardViewProps) {
  const { boardId } = useParams();
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
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

  const myRole = members.find((m) => m.userId === user.id)?.role;
  const isOwner = myRole === "OWNER";

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

  async function handleInviteMember(event: React.SubmitEvent<HTMLFormElement>) {
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
        body: JSON.stringify({
          username: usernameToInvite,
          role: targetRole,
        }),
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

  async function handleAddCard(event: React.SubmitEvent) {
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
      refreshUnblocked();
      setDependencyTarget({ ...dependencyTarget, [cardId]: "" });
    } else {
      const errors = await response.json();
      alert(errors[0] ?? "Could not add dependency.");
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
      refreshUnblocked();
    }
  }

  async function toggleComplete(card: Card) {
    console.log("toggle call");
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
      refreshUnblocked();
    }
  }

  function refreshUnblocked() {
    fetch(`http://localhost:8080/api/board/${boardId}/unblocked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids: number[]) => setUnblockedIds(Array.isArray(ids) ? ids : []));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Board</h1>
      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">Members</h2>
        <ul className="text-sm space-y-1 mb-4">
          {members.map((m) => (
            <li key={m.userId} className="flex justify-between max-w-xs">
              <span>{m.username}</span>
              <span className="text-gray-500">{m.role}</span>
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

      {/* Ready to work on — the differentiator, delivered as a list */}
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

      {/* Add card form */}
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

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.id} className="bg-gray-50 rounded-lg p-3 w-64 shrink-0">
            <h3 className="font-semibold mb-2">{col.name}</h3>
            <div className="space-y-2">
              {cards
                .filter((c) => c.columnId === col.id)
                .map((card) => {
                  const isBlocked =
                    !unblockedIds.includes(card.id) && !card.isComplete;
                  return (
                    <div
                      key={card.id}
                      className="bg-white border rounded-lg p-3"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={card.isComplete}
                          disabled={isBlocked}
                          onChange={() => toggleComplete(card)}
                        />
                        <span
                          className={
                            card.isComplete ? "line-through text-gray-400" : ""
                          }
                        >
                          {card.title}
                        </span>
                      </label>
                      <div className="mt-1 flex gap-1">
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
                      <div className="mt-1">
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
                      {!unblockedIds.includes(card.id) && !card.isComplete && (
                        <span className="text-xs text-rose-600">blocked</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardView;
