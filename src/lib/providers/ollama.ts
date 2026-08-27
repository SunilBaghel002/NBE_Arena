import { IVisionProvider, ExtractedQuestion, ExtractionTelemetry } from "./types";
import { EXTRACTION_SYSTEM_PROMPT, REPAIR_JSON_PROMPT } from "../prompts";

export class OllamaAdapter implements IVisionProvider {
  public readonly name = "ollama";
  public readonly defaultModel = process.env.OLLAMA_VISION_MODEL || "qwen2.5-vl:7b";
  public readonly baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  private cleanJson(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    return text;
  }

  private getRawBase64(base64Image: string): string {
    if (base64Image.includes(";base64,")) {
      return base64Image.split(";base64,")[1];
    }
    return base64Image;
  }

  private async callChat(model: string, messages: any[]): Promise<{ content: string; evalCount?: number }> {
    const url = `${this.baseUrl}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0,
        },
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Ollama API Error (${res.status}): ${msg}`);
    }

    const data = await res.json();
    const content = data.message?.content || "";
    return { content, evalCount: data.eval_count };
  }

  public async extractFromImage(
    base64Image: string,
    mimeType: string = "image/png",
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const model = modelOverride || this.defaultModel;
    const startTime = Date.now();
    const rawBase64 = this.getRawBase64(base64Image);

    const messages = [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: "Extract all MCQs from this exam page image. Return ONLY a valid JSON array following the specified schema.",
        images: [rawBase64],
      },
    ];

    let result = await this.callChat(model, messages);
    let rawText = this.cleanJson(result.content);
    let questions: ExtractedQuestion[] = [];

    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("Ollama JSON parse error, attempting 1-shot repair...");
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
        completionTokens: result.evalCount,
        rawResponse: rawText,
      },
    };
  }
}
