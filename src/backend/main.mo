import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AnalysisLib "lib/analysis";
import MixinAnalysis "mixins/analysis-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  let analysisStore : AnalysisLib.AnalysisMap = Map.empty();
  let analysisCounter : AnalysisLib.CounterState = { var nextId = 0 };
  let openAIKeys : Map.Map<Principal, Text> = Map.empty();

  include MixinAnalysis(analysisStore, analysisCounter, openAIKeys);
};
