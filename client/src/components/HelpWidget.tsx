import { useState } from "react";

interface HelpWidgetProps {
  token: string;
}

interface AskHelpResponse {
  answer: string;
  sources: string[];
}

function HelpWidget({ token }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskHelpResponse | null>(null);

  async function handleAsk(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8080/api/help/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        setError(
          res.status === 503
            ? "Can't reach the local help assistant. Is Ollama running?"
            : "Something went wrong asking the help assistant.",
        );
        return;
      }

      const data: AskHelpResponse = await res.json();
      setResult(data);
    } catch {
      setError("Can't reach the server. Is it running?");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-3 w-80 max-h-[28rem] flex flex-col rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-sm">How do I use this app?</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
              aria-label="Close help"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 text-sm space-y-3">
            {!result && !error && !isLoading && (
              <p className="text-gray-400">
                Ask a question about boards, cards, dependencies, or roles.
              </p>
            )}
            {isLoading && <p className="text-gray-400">Thinking…</p>}
            {error && <p className="text-red-600">{error}</p>}
            {result && (
              <div className="space-y-2">
                <p className="whitespace-pre-wrap">{result.answer}</p>
                {result.sources.length > 0 && (
                  <p className="text-xs text-gray-400">
                    Sources: {result.sources.join(", ")}
                  </p>
                )}
              </div>
            )}
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
              className="bg-indigo-600 text-white text-sm rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center text-xl hover:bg-indigo-700"
        aria-label="Open help"
      >
        ?
      </button>
    </div>
  );
}

export default HelpWidget;
