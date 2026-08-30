import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Board {
  id: number;
  name: string;
  ownerId: number;
}

interface BoardListProps {
  token: string;
}

function BoardList({ token }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/board", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Board[]) => setBoards(data))
      .catch(console.error);
  }, [token]);

  async function handleCreate(event: React.SubmitEvent) {
    event.preventDefault();

    const response = await fetch("http://localhost:8080/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      const newBoard: Board = await response.json();
      setBoards([...boards, newBoard]);
      setName("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your boards</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New board name"
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-indigo-600 text-white rounded-lg px-4 py-2">
          Create
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="border rounded-lg p-4 hover:border-indigo-400"
          >
            <h2 className="font-semibold">{board.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BoardList;