import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/analysis";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

/// Domain logic for forex chart analyses. All functions are stateless;
/// callers inject the shared state slices.
module {
  public type AnalysisMap = Map.Map<Types.AnalysisId, Types.Analysis>;
  public type CounterState = { var nextId : Nat };

  /// Create and persist a new analysis record.
  public func create(
    store   : AnalysisMap,
    counter : CounterState,
    owner   : Types.UserId,
    imageKey : Text,
    entryPrice : Float,
    stopLoss   : Float,
    takeProfits : Types.TakeProfits,
    riskReward  : Float,
    summary     : Text,
    platform    : ?Types.Platform,
    createdAt   : Int,
    notes       : Text,
  ) : Types.Analysis {
    let id = counter.nextId;
    counter.nextId += 1;
    let analysis : Types.Analysis = {
      id;
      owner;
      imageKey;
      entryPrice;
      stopLoss;
      takeProfits;
      riskReward;
      summary;
      platform;
      createdAt;
      notes;
    };
    store.add(id, analysis);
    analysis;
  };

  /// Return a single analysis owned by `caller`. Returns null if not found or not owned.
  public func getOwned(
    store  : AnalysisMap,
    caller : Types.UserId,
    id     : Types.AnalysisId,
  ) : ?Types.Analysis {
    switch (store.get(id)) {
      case (?a) { if (Principal.equal(a.owner, caller)) ?a else null };
      case null null;
    };
  };

  /// Return paginated summaries for all analyses owned by `caller`.
  public func listOwned(
    store  : AnalysisMap,
    caller : Types.UserId,
    offset : Nat,
    limit  : Nat,
  ) : Types.Page {
    // Collect all analyses owned by caller, sorted newest first
    let owned = List.empty<Types.AnalysisSummary>();
    for ((_, a) in store.entries()) {
      if (Principal.equal(a.owner, caller)) {
        owned.add(toSummary(a));
      };
    };
    // Sort by createdAt descending
    owned.sortInPlace(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    let total = owned.size();
    let safeOffset = if (offset > total) total else offset;
    let available : Nat = if (total > safeOffset) { total - safeOffset } else 0;
    let safeLimit : Nat = if (limit > available) available else limit;
    let items = owned.sliceToArray(safeOffset, safeOffset + safeLimit);
    { items; total; offset = safeOffset; limit = safeLimit };
  };

  /// Delete an analysis owned by `caller`. Returns true if deleted.
  public func deleteOwned(
    store  : AnalysisMap,
    caller : Types.UserId,
    id     : Types.AnalysisId,
  ) : Bool {
    switch (store.get(id)) {
      case (?a) {
        if (Principal.equal(a.owner, caller)) {
          store.remove(id);
          true;
        } else false;
      };
      case null false;
    };
  };

  /// Convert an Analysis to its AnalysisSummary projection.
  public func toSummary(a : Types.Analysis) : Types.AnalysisSummary {
    {
      id         = a.id;
      imageKey   = a.imageKey;
      entryPrice = a.entryPrice;
      stopLoss   = a.stopLoss;
      takeProfits = a.takeProfits;
      riskReward = a.riskReward;
      platform   = a.platform;
      createdAt  = a.createdAt;
      notes      = a.notes;
    };
  };
};
