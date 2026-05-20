import { createActor } from "@/backend";
import type { Analysis, AnalysisSummary, Page } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const PAGE_SIZE = 10;

export function useAnalysisHistory() {
  const { actor, isFetching } = useActor(createActor);
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<AnalysisSummary[]>([]);
  const [total, setTotal] = useState(0);

  const query = useQuery<Page>({
    queryKey: ["analyses", offset],
    queryFn: async () => {
      if (!actor)
        return {
          items: [],
          total: BigInt(0),
          offset: BigInt(0),
          limit: BigInt(PAGE_SIZE),
        };
      const result = await actor.listAnalyses(
        BigInt(offset),
        BigInt(PAGE_SIZE),
      );
      if (result.__kind__ === "ok") {
        const page = result.ok;
        if (offset === 0) {
          setAllItems(page.items);
        } else {
          setAllItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id.toString()));
            const newItems = page.items.filter(
              (i) => !existingIds.has(i.id.toString()),
            );
            return [...prev, ...newItems];
          });
        }
        setTotal(Number(page.total));
        return page;
      }
      return {
        items: [],
        total: BigInt(0),
        offset: BigInt(offset),
        limit: BigInt(PAGE_SIZE),
      };
    },
    enabled: !!actor && !isFetching,
  });

  const loadMore = () => {
    if (allItems.length < total) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  };

  const hasMore = allItems.length < total;

  return {
    items: allItems,
    total,
    hasMore,
    loadMore,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetching && offset > 0,
  };
}

export function useAnalysis(id: bigint | null) {
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

export function useDeleteAnalysis() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteAnalysis(id);
      if (result.__kind__ === "err") throw new Error("Analysis not found");
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate all analysis list pages so they refresh
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      // Remove specific analysis from cache
      queryClient.removeQueries({
        queryKey: ["analysis", deletedId.toString()],
      });
    },
  });
}
