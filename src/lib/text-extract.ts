import { ITextProvider, ExtractedQuestion, ExtractionTelemetry } from "./providers/types";
import { GroqAdapter } from "./providers/groq";
import { OpenRouterAdapter } from "./providers/openrouter";

export class TextExtractor {
  private groqAdapter = new GroqAdapter();
  private openRouterAdapter = new OpenRouterAdapter();

  public getProvider(providerName?: string): ITextProvider {
    const active = (providerName || process.env.TEXT_PROVIDER || "groq").toLowerCase();

    switch (active) {
      case "openrouter":
        return this.openRouterAdapter;
      case "groq":
      default:
        return this.groqAdapter;
    }
  }

  public async extractPage(
    pageText: string,
    providerName?: string,
    modelOverride?: string
  ): Promise<{ questions: ExtractedQuestion[]; telemetry: ExtractionTelemetry }> {
    const provider = this.getProvider(providerName);
    return provider.extractFromText(pageText, modelOverride);
  }
}

export const textExtractor = new TextExtractor();
