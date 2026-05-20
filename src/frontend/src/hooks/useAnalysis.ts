import { createActor } from "@/backend";
import type { Analysis, AnalysisSummary, AnalyzeRequest } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useIsOpenAIConfigured() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["openai-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMyOpenAIConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetOpenAIKey() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.setMyOpenAIApiKey(key);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openai-configured"] });
      toast.success("API key saved successfully");
    },
    onError: () => {
      toast.error("Failed to save API key");
    },
  });
}

export function useClearOpenAIKey() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.clearMyOpenAIApiKey();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openai-configured"] });
      toast.success("API key cleared");
    },
    onError: () => {
      toast.error("Failed to clear API key");
    },
  });
}

export function useListAnalyses(offset = 0n, limit = 20n) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AnalysisSummary[]>({
    queryKey: ["analyses", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listAnalyses(offset, limit);
      if (result.__kind__ === "ok") return result.ok.items;
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAnalysis(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Analysis | null>({
    queryKey: ["analysis", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const result = await actor.getAnalysis(id);
      if (result.__kind__ === "ok") return result.ok;
      return null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAnalyzeChart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: AnalyzeRequest) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.analyzeChart(req);
      if (result.__kind__ === "ok") return result.ok;
      if (result.__kind__ === "err") {
        const err = result.err;
        if (err.__kind__ === "noApiKey") {
          throw new Error("NO_API_KEY");
        }
        if (err.__kind__ === "analysisError") {
          throw new Error(err.analysisError);
        }
      }
      throw new Error("Unknown error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useUpdateNotes() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: bigint; notes: string }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateNotes(id, notes);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["analysis", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Notes saved");
    },
    onError: () => {
      toast.error("Failed to save notes");
    },
  });
}

export function useLivePrice(symbol: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<number | null>({
    queryKey: ["live-price", symbol],
    queryFn: async () => {
      if (!actor || !symbol) return null;
      const result = await actor.getLivePrice(symbol);
      if (result.__kind__ === "ok") return result.ok;
      return null;
    },
    enabled: !!actor && !isFetching && !!symbol,
    refetchInterval: 60000,
  });
}

export function useDeleteAnalysis() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteAnalysis(id);
      if (result.__kind__ === "err")
        throw new Error("Failed to delete analysis");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Analysis deleted");
    },
    onError: () => {
      toast.error("Failed to delete analysis");
    },
  });
}
