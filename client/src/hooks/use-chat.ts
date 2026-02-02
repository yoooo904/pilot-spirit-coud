import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export function useChatMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();
      return (data.messages || []) as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useChatStream(conversationId: number) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      setIsStreaming(true);
      setStreamedContent("");
      
      // Optimistic update for user message
      const tempId = Date.now();
      queryClient.setQueryData(
        ["/api/conversations", conversationId, "messages"],
        (old: Message[] = []) => [
          ...old,
          { id: tempId, role: "user", content }
        ]
      );

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) throw new Error("Failed to send message");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let done = false;
        let accumulatedResponse = "";
        let audioChunks: string[] = [];

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                try {
                  const data = JSON.parse(jsonStr);
                  if (data.type === "transcript" || data.content) {
                    accumulatedResponse += data.data || data.content;
                    setStreamedContent(accumulatedResponse);
                  }
                  if (data.type === "audio") {
                    // Play audio chunk immediately or collect it
                    const audioBase64 = data.data;
                    const audioBlob = await (await fetch(`data:audio/pcm;base64,${audioBase64}`)).blob();
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.play().catch(e => console.error("Audio playback failed", e));
                  }
                  if (data.type === "done" || data.done) {
                    done = true;
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
        return accumulatedResponse;
      } finally {
        setIsStreaming(false);
        // Invalidate to get clean state from DB
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations", conversationId, "messages"]
        });
      }
    },
  });

  return {
    sendMessage: sendMessage.mutate,
    isPending: sendMessage.isPending || isStreaming,
    isStreaming,
    streamedContent,
  };
}
