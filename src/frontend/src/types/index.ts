import type { Principal } from "@icp-sdk/core/principal";

export type {
  Analysis,
  AnalysisSummary,
  TakeProfits,
  Page,
  AnalysisId,
  AnalyzeRequest,
  Platform,
} from "@/backend";

export interface UserProfile {
  principal: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export type { Principal };
