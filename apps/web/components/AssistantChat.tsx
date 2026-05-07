"use client";

import { Bot, CheckCircle2, MessageCircle, SendHorizontal, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { feedPapers, thesisReport } from "@/lib/mock-data";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

const starterMessages: ChatMessage[] = [
  {
    content: "What should I read next to validate my LOAO thesis?",
    id: "user-seed",
    role: "user"
  },
  {
    citations: [feedPapers[0].id, feedPapers[1].id],
    content:
      "Start with the shape descriptor paper, then compare it with the carbon heterogeneity paper. Together they separate molecule-side generalization from adsorbent-side missing variables.",
    id: "assistant-seed",
    role: "assistant"
  }
];

const suggestedQuestions = [
  "Which paper most directly overlaps with my thesis?",
  "What evidence is missing before this becomes defensible?",
  "Which descriptor family should I test first?"
];

async function askAssistant(question: string) {
  const response = await fetch("/api/assistant/ask", {
    body: JSON.stringify({ question }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Assistant endpoint unavailable");
  }

  const result = (await response.json()) as {
    answer: string;
    citations: Array<{ paperId: string; needsVerification?: boolean; visibility?: { label?: string } }>;
  };

  return {
    citations: result.citations.map((citation) =>
      citation.needsVerification ? `${citation.paperId} (${citation.visibility?.label ?? "verify"})` : citation.paperId
    ),
    content: result.answer
  };
}

async function postAssistantSignal(question: string) {
  try {
    await fetch("/api/signals", {
      body: JSON.stringify({
        entityId: "active-thesis",
        entityType: "thesis",
        metadata: { questionLength: question.length, source: "assistant" },
        type: "assistant_ask",
        weight: 0.78
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
  } catch {
    // Assistant signals improve ranking, but questions must still work without them.
  }
}

function fallbackAnswer(question: string): Pick<ChatMessage, "content" | "citations"> {
  const normalized = question.toLowerCase();

  if (normalized.includes("missing") || normalized.includes("evidence")) {
    return {
      citations: [feedPapers[1].id, "thesis-report"],
      content: `The biggest gaps are ${thesisReport.missingEvidence.slice(0, 2).join(" and ")}. Treat those as blocker checks before claiming the descriptor result generalizes.`
    };
  }

  if (normalized.includes("descriptor")) {
    return {
      citations: [feedPapers[0].id],
      content:
        "Test shape-sensitive molecular descriptors first, then add adsorbent-side descriptors so the ablation distinguishes molecule effects from surface chemistry effects."
    };
  }

  return {
    citations: [feedPapers[0].id, feedPapers[2].id],
    content:
      "The strongest next move is to convert the top papers into claim cards, then ask whether each claim supports, weakens, or reframes the active thesis."
  };
}

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking">("idle");

  async function submitQuestion(question: string) {
    const trimmed = question.trim();

    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      content: trimmed,
      id: `user-${Date.now()}`,
      role: "user"
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setStatus("thinking");
    void postAssistantSignal(trimmed);

    try {
      const result = await askAssistant(trimmed);
      setMessages((current) => [
        ...current,
        {
          citations: result.citations,
          content: result.content,
          id: `assistant-${Date.now()}`,
          role: "assistant"
        }
      ]);
    } catch {
      const result = fallbackAnswer(trimmed);
      setMessages((current) => [
        ...current,
        {
          citations: result.citations,
          content: result.content,
          id: `assistant-${Date.now()}`,
          role: "assistant"
        }
      ]);
    } finally {
      setStatus("idle");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(draft);
  }

  return (
    <section className="grid">
      <div className="panel span-8" style={{ display: "grid", gap: 16 }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">Cited assistant</p>
            <h3 style={{ margin: "10px 0 0" }}>Ask the graph, not the void</h3>
          </div>
          <span className="metric-pill">
            <CheckCircle2 size={14} />
            Local fallback on
          </span>
        </div>

        <div className="insight-list">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            return (
              <article className={isAssistant ? "panel thesis-box" : "panel"} key={message.id} style={{ boxShadow: "none" }}>
                <p className="meta" style={{ alignItems: "center", display: "flex", gap: 8 }}>
                  {isAssistant ? <Bot size={15} /> : <UserRound size={15} />}
                  {isAssistant ? "PaperGraph AI" : "You"}
                </p>
                <p className="body-copy">{message.content}</p>
                {message.citations?.length ? (
                  <div className="metric-row" style={{ marginTop: 12 }}>
                    {message.citations.map((citation) => (
                      <span className="metric-pill" key={citation}>
                        {citation}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <form className="row-actions" onSubmit={handleSubmit}>
          <input
            className="button"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about saved papers..."
            style={{ flex: 1, justifyContent: "flex-start", minWidth: 220 }}
            value={draft}
          />
          <button className="button primary" disabled={status === "thinking" || draft.trim().length === 0} type="submit">
            <SendHorizontal size={16} />
            {status === "thinking" ? "Thinking..." : "Ask"}
          </button>
        </form>
      </div>

      <aside className="panel span-4" style={{ display: "grid", gap: 14 }}>
        <div>
          <p className="eyebrow">Prompt queue</p>
          <h3 style={{ margin: "10px 0 0" }}>Suggested questions</h3>
        </div>
        <ul className="insight-list">
          {suggestedQuestions.map((question) => (
            <li key={question}>
              <button
                className="button"
                onClick={() => void submitQuestion(question)}
                style={{ justifyContent: "flex-start", width: "100%" }}
                type="button"
              >
                <MessageCircle size={15} />
                {question}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
