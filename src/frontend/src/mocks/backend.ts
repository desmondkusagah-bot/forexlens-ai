import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  analyzeChart: async (_req) => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      owner: { toText: () => "aaaaa-aa", isAnonymous: () => false } as any,
      createdAt: BigInt(Date.now() * 1_000_000),
      platform: "TradingView",
      riskReward: 2.5,
      summary:
        "Bullish continuation pattern detected on EUR/USD H4 chart. Price has broken above the key resistance zone at 1.0850, with strong momentum confirmed by the MACD crossover. Entry is recommended at current price with a tight stop below the recent swing low. Five take profit targets are set at key Fibonacci extension levels.",
      imageKey: "mock-image-key",
      notes: "",
      stopLoss: 1.0812,
      entryPrice: 1.0848,
      takeProfits: {
        tp1: 1.0884,
        tp2: 1.0920,
        tp3: 1.0956,
        tp4: 1.0992,
        tp5: 1.1028,
      },
    },
  }),

  clearMyOpenAIApiKey: async () => ({ __kind__: "ok" } as any),

  deleteAnalysis: async (_id) => ({ __kind__: "ok", ok: null }),

  getAnalysis: async (_id) => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      owner: { toText: () => "aaaaa-aa", isAnonymous: () => false } as any,
      createdAt: BigInt(Date.now() * 1_000_000),
      platform: "TradingView",
      riskReward: 2.5,
      summary:
        "Bullish continuation pattern detected on EUR/USD H4 chart.",
      imageKey: "mock-image-key",
      notes: "",
      stopLoss: 1.0812,
      entryPrice: 1.0848,
      takeProfits: {
        tp1: 1.0884,
        tp2: 1.0920,
        tp3: 1.0956,
        tp4: 1.0992,
        tp5: 1.1028,
      },
    },
  }),

  isMyOpenAIConfigured: async () => true,

  listAnalyses: async (_offset, _limit) => ({
    __kind__: "ok",
    ok: {
      total: BigInt(3),
      offset: BigInt(0),
      limit: BigInt(10),
      items: [
        {
          id: BigInt(1),
          createdAt: BigInt(Date.now() * 1_000_000),
          platform: "TradingView",
          riskReward: 2.5,
          imageKey: "mock-image-key-1",
          notes: "",
          stopLoss: 1.0812,
          entryPrice: 1.0848,
          takeProfits: {
            tp1: 1.0884,
            tp2: 1.0920,
            tp3: 1.0956,
            tp4: 1.0992,
            tp5: 1.1028,
          },
        },
        {
          id: BigInt(2),
          createdAt: BigInt((Date.now() - 3600000) * 1_000_000),
          platform: "MT4",
          riskReward: 1.8,
          imageKey: "mock-image-key-2",
          notes: "",
          stopLoss: 1.2645,
          entryPrice: 1.2680,
          takeProfits: {
            tp1: 1.2715,
            tp2: 1.2750,
            tp3: 1.2785,
            tp4: 1.2820,
            tp5: 1.2855,
          },
        },
        {
          id: BigInt(3),
          createdAt: BigInt((Date.now() - 7200000) * 1_000_000),
          platform: "MT5",
          riskReward: 3.1,
          imageKey: "mock-image-key-3",
          notes: "",
          stopLoss: 1850.5,
          entryPrice: 1855.0,
          takeProfits: {
            tp1: 1863.5,
            tp2: 1872.0,
            tp3: 1880.5,
            tp4: 1889.0,
            tp5: 1897.5,
          },
        },
      ],
    },
  }),

  setMyOpenAIApiKey: async (_key) => ({ __kind__: "ok" } as any),

  updateNotes: async (_id, _notes) => ({ __kind__: "ok", ok: null }),

  getLivePrice: async (_symbol) => ({ __kind__: "ok", ok: 1.08455 }),

  transform: async (_input) => ({ status: BigInt(200), body: new Uint8Array(), headers: [] }),
};
