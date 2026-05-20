import Time "mo:core/Time";

module {
  public type AnalysisId = Nat;
  public type UserId = Principal;

  /// Platform the chart was captured from (e.g. "MT4", "MT5", "TradingView")
  public type Platform = Text;

  /// Five take-profit levels
  public type TakeProfits = {
    tp1 : Float;
    tp2 : Float;
    tp3 : Float;
    tp4 : Float;
    tp5 : Float;
  };

  /// Full analysis record stored per user
  public type Analysis = {
    id        : AnalysisId;
    owner     : UserId;
    imageKey  : Text;          // object-storage key for the uploaded chart image
    entryPrice : Float;
    stopLoss  : Float;
    takeProfits : TakeProfits;
    riskReward  : Float;       // computed risk/reward ratio
    summary     : Text;        // GPT-4o narrative analysis
    platform    : ?Platform;   // optional platform hint
    createdAt   : Int;         // Time.now() nanoseconds
    notes       : Text;        // user journal notes
  };

  /// Lightweight summary returned in paginated list responses
  public type AnalysisSummary = {
    id        : AnalysisId;
    imageKey  : Text;
    entryPrice : Float;
    stopLoss  : Float;
    takeProfits : TakeProfits;
    riskReward  : Float;
    platform    : ?Platform;
    createdAt   : Int;
    notes       : Text;
  };

  /// Request payload for creating an analysis via GPT-4o
  public type AnalyzeRequest = {
    imageKey   : Text;    // object-storage key for the chart image
    imageUrl   : Text;    // public HTTPS URL the GPT-4o vision call will read
    platform   : ?Platform;
  };

  /// Paginated response wrapper
  public type Page = {
    items  : [AnalysisSummary];
    total  : Nat;
    offset : Nat;
    limit  : Nat;
  };
};
