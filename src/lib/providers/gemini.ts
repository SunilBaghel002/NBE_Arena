import { IVisionProvider, ExtractedQuestion, ExtractionTelemetry } from "./types";
import { EXTRACTION_SYSTEM_PROMPT, REPAIR_JSON_PROMPT } from "../prompts";

export class GeminiAdapter implements IVisionProvider {
  public readonly name = "gemini";
  public readonly defaultModel = process.env.GEMINI_VISION_MODEL || "gemini-2.0-flash";

  private getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set in environment");
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

  private getRawBase64(base64Image: string): string {
    if (base64Image.includes(";base64,")) {
      return base64Image.split(";base64,")[1];
    }
    return base64Image;
  }

  private async generateContent(
    model: string,
    contents: any[],
    systemInstruction?: string
  ): Promise<{ text: string; usage?: any }> {
    const apiKey = this.getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || res.statusText;
      throw new Error(`Gemini API Error (${res.status}): ${msg}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";
    return { text, usage: data.usageMetadata };
  }

  public async extractFromImage(
    base64Image: string,
    mimeType: string = "image/png",
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const model = modelOverride || this.defaultModel;
    const startTime = Date.now();
    const rawBase64 = this.getRawBase64(base64Image);

    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: rawBase64,
            },
          },
          {
            text: "Extract all MCQs from this exam page image. Return ONLY a valid JSON array following the specified schema.",
          },
        ],
      },
    ];

    let result = await this.generateContent(model, contents, EXTRACTION_SYSTEM_PROMPT);
    let rawText = this.cleanJson(result.text);
    let questions: ExtractedQuestion[] = [];

    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("Gemini JSON parse error, attempting 1-shot repair...");
      const repairContents = [
        {
          role: "user",
          parts: [{ text: REPAIR_JSON_PROMPT(rawText) }],
        },
      ];
      const repaired = await this.generateContent(
        model,
        repairContents,
        "You are a JSON repair tool. Output only valid JSON."
      );
      questions = JSON.parse(this.cleanJson(repaired.text));
    }

    const durationMs = Date.now() - startTime;

    return {
      questions: Array.isArray(questions) ? questions : [],
      telemetry: {
        provider: this.name,
        model,
        mode: "vision",
        durationMs,
        promptTokens: result.usage?.promptTokenCount,
        completionTokens: result.usage?.candidatesTokenCount,
        rawResponse: rawText,
      },
    };
  }
}
