import { defaultConfig; type Config } "mo:openai-client/Config";
import ChatApi "mo:openai-client/Apis/ChatApi";
import CreateChatCompletionRequest "mo:openai-client/Models/CreateChatCompletionRequest";
import ChatCompletionRequestUserMessage "mo:openai-client/Models/ChatCompletionRequestUserMessage";
import ChatCompletionRequestMessageContentPartImage "mo:openai-client/Models/ChatCompletionRequestMessageContentPartImage";
import ChatCompletionRequestMessageContentPartText "mo:openai-client/Models/ChatCompletionRequestMessageContentPartText";
import Runtime "mo:core/Runtime";

/// OpenAI SDK glue — config builder and vision-based chart analysis.
module {
  /// Build a non-replicated Config bound to a single bearer key.
  /// `is_replicated = ?false` is mandatory (security, billing, determinism).
  public func configForKey(key : Text) : Config {
    {
      defaultConfig with
      auth = ?#bearer key;
      is_replicated = ?false;
    };
  };

  /// Call GPT-4o vision to analyse a forex chart image and return
  /// a JSON string with trade levels (entry, stopLoss, tp1-tp5, summary).
  public func analyzeChart(
    config   : Config,
    imageUrl : Text,
    platform : ?Text,
  ) : async* Text {
    let platformHint = switch platform {
      case (?p) " The chart is from " # p # ".";
      case null "";
    };
    let systemPrompt = "You are an expert forex technical analyst. Analyze the provided forex chart image and return ONLY a JSON object (no markdown, no explanation) with these exact fields: entryPrice (number), stopLoss (number), tp1 (number), tp2 (number), tp3 (number), tp4 (number), tp5 (number), riskReward (number, ratio as decimal), summary (string, 2-3 sentence narrative), platform (string or null)." # platformHint # " Base all levels on the chart's visible price action, support/resistance, and candlestick patterns. All prices must be realistic given the chart.";
    let textPart = ChatCompletionRequestMessageContentPartText.JSON.init({
      text_ = systemPrompt;
      type_ = #text_;
    });
    let imagePart = ChatCompletionRequestMessageContentPartImage.JSON.init({
      type_ = #image_url;
      image_url = { url = imageUrl; detail = ?#high };
    });
    let userMessage = ChatCompletionRequestUserMessage.JSON.init({
      content = #array([#text_(textPart), #image_url(imagePart)]);
      role = #user;
    });
    let req = CreateChatCompletionRequest.JSON.init({
      messages = [#user(userMessage)];
      model = "gpt-4o";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("OpenAI returned no choices");
    };
    switch (resp.choices[0].message.content) {
      case (?text) text;
      case null Runtime.trap("OpenAI returned no content");
    };
  };
};
