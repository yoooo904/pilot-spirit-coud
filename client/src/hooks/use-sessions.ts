import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Session } from "@shared/schema";

// Helper to validate/parse API responses just in case, though we trust the backend mostly
function parseResponse<T>(schema: any, data: unknown): T {
  // In a real app we'd parse with Zod, here we cast for speed if schemas match
  return data as T;
}

export function useSession(id: number | null) {
  return useQuery({
    queryKey: [api.sessions.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.sessions.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch session");
      return await res.json() as Session;
    },
    enabled: !!id,
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.sessions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return await res.json() as Session;
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Session> }) => {
      const url = buildUrl(api.sessions.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH", // Using PATCH based on routes_manifest
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update session");
      return await res.json() as Session;
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData([api.sessions.get.path, updatedSession.id], updatedSession);
    },
  });
}

export function useGenerateSpirit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sessions.generateSpirit.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to summon spirit");
      return await res.json() as Session;
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData([api.sessions.get.path, updatedSession.id], updatedSession);
    },
  });
}
