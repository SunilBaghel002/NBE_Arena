import { ITextProvider, ExtractedQuestion, ExtractionTelemetry } from "./types";
import { EXTRACTION_SYSTEM_PROMPT, TEXT_EXTRACTION_USER_PROMPT, REPAIR_JSON_PROMPT } from "../prompts";

export class GroqAdapter implements ITextProvider {
  public readonly name = "groq";
  public readonly defaultModel = process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-120b";

  private getApiKey(): string {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error("GROQ_API_KEY is not set in environment");
    }
    return key;
  }

  private cleanJson(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    return text;
  }

  private async callChat(model: string, messages: any[]): Promise<{ content: string; usage?: any }> {
    const apiKey = this.getApiKey();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      throw new Error(`Groq API Error (${res.status}): ${msg}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { content, usage: data.usage };
  }

  public async extractFromText(
    pageText: string,
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const model = modelOverride || this.defaultModel;
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
      console.warn("Groq JSON parse error, attempting 1-shot repair...");
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
