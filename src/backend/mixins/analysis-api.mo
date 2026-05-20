import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Types "../types/analysis";
import AnalysisLib "../lib/analysis";
import OpenAI "../lib/openai";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";
import Int32 "mo:core/Int32";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Outcall "mo:caffeineai-http-outcalls/outcall";

/// Public API mixin for the analysis domain.
/// Mounted by main.mo via `include`.
mixin (
  analysisStore : AnalysisLib.AnalysisMap,
  analysisCounter : AnalysisLib.CounterState,
  openAIKeys : Map.Map<Principal, Text>,
) {
    /// Transform function required by the HTTP outcalls extension.
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

/// Returns true if the caller has configured their OpenAI API key.
  public query ({ caller }) func isMyOpenAIConfigured() : async Bool {
    openAIKeys.containsKey(caller);
  };

  /// Store the caller's OpenAI API key (write-only; never returned).
  public shared ({ caller }) func setMyOpenAIApiKey(key : Text) : async { #ok } {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to use this feature");
    };
    openAIKeys.add(caller, key);
    #ok;
  };

  /// Remove the caller's stored OpenAI API key.
  public shared ({ caller }) func clearMyOpenAIApiKey() : async { #ok } {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to use this feature");
    };
    openAIKeys.remove(caller);
    #ok;
  };

  /// Analyze a forex chart image using GPT-4o vision and persist the result.
  public shared ({ caller }) func analyzeChart(req : Types.AnalyzeRequest) : async { #ok : Types.Analysis; #err : { #noApiKey; #analysisError : Text } } {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to use this feature");
    };
    let ?apiKey = openAIKeys.get(caller) else {
      return #err(#noApiKey);
    };
    let config = OpenAI.configForKey(apiKey);
    let platformText = switch (req.platform) {
      case (?p) ?p;
      case null null;
    };
    let jsonText = await* OpenAI.analyzeChart(config, req.imageUrl, platformText);
    let parsed = parseAnalysisJson(jsonText);
    switch parsed {
      case (#err(msg)) #err(#analysisError(msg));
      case (#ok(fields)) {
        let analysis = AnalysisLib.create(
          analysisStore,
          analysisCounter,
          caller,
          req.imageKey,
          fields.entryPrice,
          fields.stopLoss,
          { tp1 = fields.tp1; tp2 = fields.tp2; tp3 = fields.tp3; tp4 = fields.tp4; tp5 = fields.tp5 },
          fields.riskReward,
          fields.summary,
          fields.platform,
          Time.now(),
          "",
        );
        #ok(analysis);
      };
    };
  };

  /// List all analyses for the authenticated user (paginated).
  public query ({ caller }) func listAnalyses(offset : Nat, limit : Nat) : async { #ok : Types.Page } {
    let page = AnalysisLib.listOwned(analysisStore, caller, offset, limit);
    #ok(page);
  };

  /// Get full detail for a single analysis owned by the caller.
  public query ({ caller }) func getAnalysis(id : Types.AnalysisId) : async { #ok : Types.Analysis; #err : { #notFound } } {
    switch (AnalysisLib.getOwned(analysisStore, caller, id)) {
      case (?a) #ok(a);
      case null #err(#notFound);
    };
  };

  /// Update the notes field for an analysis owned by the caller.
  public shared ({ caller }) func updateNotes(id : Types.AnalysisId, notes : Text) : async { #ok; #err : Text } {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to use this feature");
    };
    switch (AnalysisLib.getOwned(analysisStore, caller, id)) {
      case null #err("Analysis not found or not owned by you");
      case (?a) {
        analysisStore.add(id, { a with notes });
        #ok;
      };
    };
  };

  /// Fetch the current live price for a forex symbol from Finnhub (demo token).
  /// symbol: e.g. "EURUSD", "GBPUSD"
  public shared func getLivePrice(symbol : Text) : async { #ok : Float; #err : Text } {
    let url = "https://finnhub.io/api/v1/quote?symbol=OANDA:" # symbol # "&token=demo";
    let bodyText = try {
      await Outcall.httpGetRequest(url, [], transform);
    } catch (e) {
      return #err("HTTP request failed");
    };
    switch (parseFloat(bodyText, "c")) {
      case null #err("Could not parse price from response: " # bodyText);
      case (?price) {
        if (price == 0.0) {
          #err("Symbol not found or market closed: " # symbol);
        } else {
          #ok(price);
        };
      };
    };
  };

  /// Delete an analysis owned by the caller.
  public shared ({ caller }) func deleteAnalysis(id : Types.AnalysisId) : async { #ok; #err : { #notFound } } {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to use this feature");
    };
    if (AnalysisLib.deleteOwned(analysisStore, caller, id)) {
      #ok;
    } else {
      #err(#notFound);
    };
  };

  // ── Private JSON helpers ──────────────────────────────────────────────────

  type ParsedFields = {
    entryPrice : Float;
    stopLoss   : Float;
    tp1        : Float;
    tp2        : Float;
    tp3        : Float;
    tp4        : Float;
    tp5        : Float;
    riskReward : Float;
    summary    : Text;
    platform   : ?Types.Platform;
  };

  /// Parse the JSON response from GPT-4o into typed fields.
  /// Handles both plain JSON and markdown-fenced JSON (```json ... ```).
  private func parseAnalysisJson(raw : Text) : { #ok : ParsedFields; #err : Text } {
    let stripped = stripMarkdownFence(raw);
    let entryPrice = switch (parseFloat(stripped, "entryPrice")) {
      case (?v) v;
      case null return #err("Missing entryPrice in GPT-4o response");
    };
    let stopLoss = switch (parseFloat(stripped, "stopLoss")) {
      case (?v) v;
      case null return #err("Missing stopLoss in GPT-4o response");
    };
    let tp1 = switch (parseFloat(stripped, "tp1")) {
      case (?v) v;
      case null return #err("Missing tp1 in GPT-4o response");
    };
    let tp2 = switch (parseFloat(stripped, "tp2")) {
      case (?v) v;
      case null return #err("Missing tp2 in GPT-4o response");
    };
    let tp3 = switch (parseFloat(stripped, "tp3")) {
      case (?v) v;
      case null return #err("Missing tp3 in GPT-4o response");
    };
    let tp4 = switch (parseFloat(stripped, "tp4")) {
      case (?v) v;
      case null return #err("Missing tp4 in GPT-4o response");
    };
    let tp5 = switch (parseFloat(stripped, "tp5")) {
      case (?v) v;
      case null return #err("Missing tp5 in GPT-4o response");
    };
    let riskReward = switch (parseFloat(stripped, "riskReward")) {
      case (?v) v;
      case null 0.0;
    };
    let summary = switch (parseText(stripped, "summary")) {
      case (?v) v;
      case null return #err("Missing summary in GPT-4o response");
    };
    let platform = parseText(stripped, "platform");
    #ok({ entryPrice; stopLoss; tp1; tp2; tp3; tp4; tp5; riskReward; summary; platform });
  };

  /// Strip leading/trailing markdown code fences (``` or ```json ... ```).
  private func stripMarkdownFence(s : Text) : Text {
    let trimmed = s.trim(#char ' ');
    let withoutLeadingFence = if (trimmed.startsWith(#text "```json")) {
      trimmed.stripStart(#text "```json");
    } else if (trimmed.startsWith(#text "```")) {
      trimmed.stripStart(#text "```");
    } else {
      ?trimmed;
    };
    switch withoutLeadingFence {
      case null trimmed;
      case (?s2) {
        let trimmed2 = s2.trim(#char ' ');
        let trimmed3 = trimmed2.trim(#char '\n');
        switch (trimmed3.stripEnd(#text "```")) {
          case (?final) final.trim(#char '\n');
          case null trimmed3;
        };
      };
    };
  };

  /// Extract a numeric JSON field value by key name.
  private func parseFloat(json : Text, key : Text) : ?Float {
    let needle = "\"" # key # "\"";
    let parts = json.split(#text needle);
    // parts[0] = before key, parts[1] = after key (starting with ":...")
    ignore parts.next(); // discard before-key part
    switch (parts.next()) {
      case null null;
      case (?afterKey) {
        let afterColon = skipToValueStart(afterKey);
        let numText = readNumber(afterColon);
        if (numText.size() == 0) return null;
        parseFloatManual(numText);
      };
    };
  };

  /// Extract a string JSON field value by key name.
  /// Returns null for JSON null values.
  private func parseText(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\"";
    let parts = json.split(#text needle);
    ignore parts.next(); // discard before-key part
    switch (parts.next()) {
      case null null;
      case (?afterKey) {
        let afterColon = skipToValueStart(afterKey);
        if (afterColon.startsWith(#text "null")) return null;
        // Find opening quote
        let quoteParts = afterColon.split(#text "\"");
        ignore quoteParts.next(); // before opening quote
        switch (quoteParts.next()) {
          case null null;
          case (?inside) {
            // Read until next quote
            let closeParts = inside.split(#text "\"");
            switch (closeParts.next()) {
              case null null;
              case (?value) ?value;
            };
          };
        };
      };
    };
  };

  /// Skip past whitespace and a colon to reach the start of a JSON value.
  private func skipToValueStart(s : Text) : Text {
    let chars = s.chars();
    var result = "";
    var colonSeen = false;
    label scanning {
      for (c in chars) {
        if (not colonSeen) {
          if (c == ':') { colonSeen := true };
        } else {
          if (c != ' ' and c != '\t' and c != '\n' and c != '\r') {
            result := Text.fromChar(c) # Text.fromIter(chars);
            break scanning;
          };
        };
      };
    };
    result;
  };

  /// Read a JSON number (digits, decimal point, minus sign, exponent).
  private func readNumber(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if ((c >= '0' and c <= '9') or c == '.' or c == '-' or c == 'e' or c == 'E' or c == '+') {
        result #= Text.fromChar(c);
      } else {
        if (result.size() > 0) {
          return result;
        };
      };
    };
    result;
  };
  /// Parse a float from a numeric string (e.g. "1.2345", "-0.5", "1e3").
  /// Handles optional leading minus, integer part, decimal part, and simple exponent.
  private func parseFloatManual(s : Text) : ?Float {
    if (s.size() == 0) return null;
    var negative = false;
    var intPart : Nat = 0;
    var fracPart : Nat = 0;
    var fracDiv : Nat = 1;
    var inFrac = false;
    var expPart : Nat = 0;
    var inExp = false;
    var expNeg = false;
    var firstChar = true;
    var valid = false;
    for (c in s.chars()) {
      if (firstChar) {
        firstChar := false;
        if (c == '-') {
          negative := true;
        } else if (c >= '0' and c <= '9') {
          intPart := (c.toNat32() - '0'.toNat32()).toNat();
          valid := true;
        } else {
          return null;
        };
      } else if (inExp) {
        if (c == '-') {
          expNeg := true;
        } else if (c == '+') {
          // skip
        } else if (c >= '0' and c <= '9') {
          expPart := expPart * 10 + (c.toNat32() - '0'.toNat32()).toNat();
        };
      } else if (c == '.') {
        inFrac := true;
      } else if (c == 'e' or c == 'E') {
        inExp := true;
      } else if (inFrac) {
        if (c >= '0' and c <= '9') {
          fracPart := fracPart * 10 + (c.toNat32() - '0'.toNat32()).toNat();
          fracDiv  := fracDiv * 10;
          valid := true;
        };
      } else {
        if (c >= '0' and c <= '9') {
          intPart := intPart * 10 + (c.toNat32() - '0'.toNat32()).toNat();
          valid := true;
        };
      };
    };
    if (not valid) return null;
    let base : Float = intPart.toFloat() + fracPart.toFloat() / fracDiv.toFloat();
    let signed : Float = if (negative) -base else base;
    let actualExp : Int = if (expNeg) -Int.fromNat(expPart) else Int.fromNat(expPart);
    let result : Float = if (actualExp == 0) signed else signed * Float.pow(10.0, actualExp.toFloat());
    ?result;
  };
};
