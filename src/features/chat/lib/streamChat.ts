/**
 * Stream helper for FoodSaver SSE Chat endpoint
 */

export interface StreamChatOptions {
  message: string;
  sessionId: string;
  token?: string | null;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone: (payload: { richCards?: any; quickSuggestions?: string[] }) => void;
  onError?: (err: any) => void;
}

export async function streamChatMessage({
  message,
  sessionId,
  token,
  signal,
  onToken,
  onDone,
  onError,
}: StreamChatOptions): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${apiBase}/api/v1/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, sessionId }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE stream failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    let doneReading = false;
    while (!doneReading) {
      const { value, done } = await reader.read();
      doneReading = done;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.replace("data: ", "").trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "token" && typeof parsed.content === "string") {
                onToken(parsed.content);
              } else if (parsed.type === "done") {
                onDone({
                  richCards: parsed.richCards,
                  quickSuggestions: parsed.quickSuggestions || [],
                });
              }
            } catch {
              // Ignore partial or non-JSON SSE lines
            }
          }
        }
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError" || signal?.aborted) {
      // Intentionally aborted by user
      return;
    }
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}
