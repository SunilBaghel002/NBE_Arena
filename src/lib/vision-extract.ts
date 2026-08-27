import { IVisionProvider, ExtractedQuestion, ExtractionTelemetry } from "./providers/types";
import { OpenRouterAdapter } from "./providers/openrouter";
import { GeminiAdapter } from "./providers/gemini";
import { OllamaAdapter } from "./providers/ollama";

export class VisionExtractor {
  private openRouterAdapter = new OpenRouterAdapter();
  private geminiAdapter = new GeminiAdapter();
  private ollamaAdapter = new OllamaAdapter();

  public getProvider(providerName?: string): IVisionProvider {
    const active = (providerName || process.env.VISION_PROVIDER || "openrouter").toLowerCase();

    switch (active) {
      case "gemini":
        return this.geminiAdapter;
      case "ollama":
        return this.ollamaAdapter;
      case "openrouter":
      default:
        return this.openRouterAdapter;
    }
  }

  public async extractPage(
    base64Image: string,
    mimeType: string = "image/png",
    providerName?: string,
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const primaryProvider = this.getProvider(providerName);

    try {
      return await primaryProvider.extractFromImage(base64Image, mimeType, modelOverride);
    } catch (primaryErr) {
      console.warn(`Primary vision provider ${primaryProvider.name} failed:`, primaryErr);

      // Fallback to Gemini if OpenRouter failed and Gemini key is available
      if (primaryProvider.name !== "gemini" && process.env.GEMINI_API_KEY) {
        console.info("Falling back to Gemini Flash vision provider...");
        return await this.geminiAdapter.extractFromImage(base64Image, mimeType);
      }

      throw primaryErr;
    }
  }
}

export const visionExtractor = new VisionExtractor();
