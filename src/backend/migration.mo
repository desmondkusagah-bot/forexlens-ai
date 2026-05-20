import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "./types/analysis";

/// Explicit migration: adds notes = "" to every existing Analysis record.
module {

  // ── Old types (copied from .old/src/backend/types/analysis.mo) ──────────

  type OldAnalysisId = Nat;
  type OldUserId = Principal;
  type OldPlatform = Text;

  type OldTakeProfits = {
    tp1 : Float;
    tp2 : Float;
    tp3 : Float;
    tp4 : Float;
    tp5 : Float;
  };

  type OldAnalysis = {
    id          : OldAnalysisId;
    owner       : OldUserId;
    imageKey    : Text;
    entryPrice  : Float;
    stopLoss    : Float;
    takeProfits : OldTakeProfits;
    riskReward  : Float;
    summary     : Text;
    platform    : ?OldPlatform;
    createdAt   : Int;
    // no `notes` field in the old version
  };

  // ── Stable state shapes ─────────────────────────────────────────────────

  type OldActor = {
    analysisStore   : Map.Map<OldAnalysisId, OldAnalysis>;
    analysisCounter : { var nextId : Nat };
    openAIKeys      : Map.Map<Principal, Text>;
  };

  type NewActor = {
    analysisStore   : Map.Map<Types.AnalysisId, Types.Analysis>;
    analysisCounter : { var nextId : Nat };
    openAIKeys      : Map.Map<Principal, Text>;
  };

  // ── Migration function ───────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    let analysisStore = old.analysisStore.map<OldAnalysisId, OldAnalysis, Types.Analysis>(
      func(_id, a) {
        {
          a with
          notes = "";
        };
      }
    );
    {
      analysisStore;
      analysisCounter = old.analysisCounter;
      openAIKeys      = old.openAIKeys;
    };
  };
};
