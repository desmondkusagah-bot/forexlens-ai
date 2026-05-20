import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export interface AnalysisSummary {
    id: AnalysisId;
    createdAt: bigint;
    platform?: Platform;
    riskReward: number;
    imageKey: string;
    stopLoss: number;
    notes: string;
    entryPrice: number;
    takeProfits: TakeProfits;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TakeProfits {
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
    tp5: number;
}
export interface Page {
    total: bigint;
    offset: bigint;
    limit: bigint;
    items: Array<AnalysisSummary>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface AnalyzeRequest {
    platform?: Platform;
    imageKey: string;
    imageUrl: string;
}
export type AnalysisId = bigint;
export interface Analysis {
    id: AnalysisId;
    owner: UserId;
    createdAt: bigint;
    platform?: Platform;
    riskReward: number;
    summary: string;
    imageKey: string;
    stopLoss: number;
    notes: string;
    entryPrice: number;
    takeProfits: TakeProfits;
}
export type Platform = string;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum Variant_notFound {
    notFound = "notFound"
}
export enum Variant_ok {
    ok = "ok"
}
export interface backendInterface {
    analyzeChart(req: AnalyzeRequest): Promise<{
        __kind__: "ok";
        ok: Analysis;
    } | {
        __kind__: "err";
        err: {
            __kind__: "analysisError";
            analysisError: string;
        } | {
            __kind__: "noApiKey";
            noApiKey: null;
        };
    }>;
    clearMyOpenAIApiKey(): Promise<Variant_ok>;
    deleteAnalysis(id: AnalysisId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: Variant_notFound;
    }>;
    getAnalysis(id: AnalysisId): Promise<{
        __kind__: "ok";
        ok: Analysis;
    } | {
        __kind__: "err";
        err: Variant_notFound;
    }>;
    getLivePrice(symbol: string): Promise<{
        __kind__: "ok";
        ok: number;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isMyOpenAIConfigured(): Promise<boolean>;
    listAnalyses(offset: bigint, limit: bigint): Promise<{
        __kind__: "ok";
        ok: Page;
    }>;
    setMyOpenAIApiKey(key: string): Promise<Variant_ok>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateNotes(id: AnalysisId, notes: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
