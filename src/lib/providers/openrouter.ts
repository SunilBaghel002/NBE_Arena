import { IVisionProvider, ITextProvider, ExtractedQuestion, ExtractionTelemetry } from "./types";
import { EXTRACTION_SYSTEM_PROMPT, TEXT_EXTRACTION_USER_PROMPT, REPAIR_JSON_PROMPT } from "../prompts";

export class OpenRouterAdapter implements IVisionProvider, ITextProvider {
  public readonly name = "openrouter";
  public readonly defaultModel = process.env.OPENROUTER_VISION_MODEL || "qwen/qwen-2.5-vl-7b-instruct";
  public readonly defaultTextModel = process.env.OPENROUTER_TEXT_MODEL || "meta-llama/llama-3.3-70b-instruct";

  private getApiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("OPENROUTER_API_KEY is not set in environment");
    }
    return key;
  }

  private cleanJson(raw: string): string {
    let text = raw.trim();
    // Remove markdown ```json ... ``` blocks if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    return text;
  }

  private async callChat(model: string, messages: any[]): Promise<{ content: string; usage?: any }> {
    const apiKey = this.getApiKey();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "NBE Arena",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 4096,
        messages,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || res.statusText;
      throw new Error(`OpenRouter API Error (${res.status}): ${msg}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { content, usage: data.usage };
  }

  // Vision Extraction (Path B)
  public async extractFromImage(
    base64Image: string,
    mimeType: string = "image/png",
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const model = modelOverride || this.defaultModel;
    const startTime = Date.now();

    const imageUrl = base64Image.startsWith("data:")
      ? base64Image
      : `data:${mimeType};base64,${base64Image}`;

    const messages = [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all MCQs from this exam page image. Return ONLY a valid JSON array following the specified schema.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ];

    let result = await this.callChat(model, messages);
    let rawText = this.cleanJson(result.content);
    let questions: ExtractedQuestion[] = [];

    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      // One-shot repair retry
      console.warn("OpenRouter JSON parse error, attempting 1-shot repair...");
      const repairMessages = [
        { role: "system", content: "You are a JSON repair tool. Output only valid JSON." },
        { role: "user", content: REPAIR_JSON_PROMPT(rawText) },
      ];
      const repaired = await this.callChat(model, repairMessages);
      questions = JSON.parse(this.cleanJson(repaired.content));
    }

    const durationMs = Date.now() - startTime;

    return {
      questions: Array.isArray(questions) ? questions : [],
      telemetry: {
        provider: this.name,
        model,
        mode: "vision",
        durationMs,
        promptTokens: result.usage?.prompt_tokens,
        completionTokens: result.usage?.completion_tokens,
        rawResponse: rawText,
      },
    };
  }

  // Text Extraction (Path A)
  public async extractFromText(
    pageText: string,
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const model = modelOverride || this.defaultTextModel;
    const startTime = Date.now();

    const messages = [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: TEXT_EXTRACTION_USER_PROMPT(pageText) },
    ];

    let result = await this.callChat(model, messages);
    let rawText = this.cleanJson(result.content);
    let questions: ExtractedQuestion[] = [];

    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("OpenRouter text JSON parse error, attempting 1-shot repair...");
      const repairMessages = [
        { role: "system", content: "You are a JSON repair tool. Output only valid JSON." },
        { role: "user", content: REPAIR_JSON_PROMPT(rawText) },
      ];
      const repaired = await this.callChat(model, repairMessages);
      questions = JSON.parse(this.cleanJson(repaired.content));
    }

    const durationMs = Date.now() - startTime;

    return {
      questions: Array.isArray(questions) ? questions : [],
      telemetry: {
        provider: this.name,
        model,
        mode: "text",
        durationMs,
        promptTokens: result.usage?.prompt_tokens,
        completionTokens: result.usage?.completion_tokens,
        rawResponse: rawText,
      },
    };
  }
}
