import { useState } from "react";

interface BoardAskWidgetProps {
  token: string;
  boardId: string;
}

interface AskBoardQuestionResponse {
  answer: string;
}

function BoardAskWidget({ token, boardId }: BoardAskWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  async function handleAsk(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/boards/${boardId}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: trimmed }),
        },
      );

      if (!res.ok) {
        setError(
          res.status === 503
            ? "Can't reach the local help assistant. Is Ollama running?"
            : res.status === 403
              ? "You don't have access to this board."
              : "Something went wrong asking about this board.",
        );
        return;
      }

      const data: AskBoardQuestionResponse = await res.json();
      setAnswer(data.answer);
    } catch {
      setError("Can't reach the server. Is it running?");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {isOpen && (
        <div className="mb-3 w-80 max-h-[28rem] flex flex-col rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-sm">Ask about this board</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
              aria-label="Close board assistant"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 text-sm space-y-3">
            {!answer && !error && !isLoading && (
              <p className="text-gray-400">
                Ask a question about this board's columns, cards, or
                dependencies.
              </p>
            )}
            {isLoading && <p className="text-gray-400">Thinking…</p>}
            {error && <p className="text-red-600">{error}</p>}
            {answer && <p className="whitespace-pre-wrap">{answer}</p>}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2 p-3 border-t">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-emerald-600 text-white text-sm rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center text-xl hover:bg-emerald-700"
        aria-label="Ask about this board"
      >
        ?
      </button>
    </div>
  );
}

export default BoardAskWidget;
