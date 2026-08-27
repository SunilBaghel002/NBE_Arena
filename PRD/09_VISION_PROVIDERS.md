# 09_VISION_PROVIDERS.md
## Multimodal Vision & Text Provider Strategy Guide

---

## 1. Executive Summary

To build an unlimited mock question repository without incurring high API costs or hitting strict commercial rate limits, NBE Arena implements a **Hybrid AI Strategy**:

1. **Path A (Text-Layer Pages):** Fast text parsing $\to$ **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
2. **Path B (Image / Scanned Pages):** High-DPI image rendering $\to$ **OpenRouter Qwen2.5-VL** (Primary), **Google Gemini 2.0 Flash** (Fallback), or **Ollama** (Offline Local).

> [!NOTE]
> We do NOT rely on paid OpenAI/Claude API quotas. We use free/cheap vision and text models with high sustainability for bulk PYQ PDF extraction.

---

## 2. Model Comparison Matrix

| Provider | Model Slug | Mode | Context Window | Speed | Cost / Tier | Best For |
|----------|------------|------|----------------|-------|-------------|----------|
| **OpenRouter** *(Primary Vision)* | `qwen/qwen-2.5-vl-7b-instruct` | Vision (Path B) | 32k tokens | Fast (~40 t/s) | Ultra-low / Free credits | Multimodal MCQ extraction, Hindi/English bilingual text, diagrams |
| **OpenRouter** *(Alternative)* | `openai/gpt-4o-mini` | Vision (Path B) | 128k tokens | Very Fast | Ultra-low | High-volume structured JSON generation |
| **Google Gemini** *(Fallback Vision)* | `gemini-2.0-flash` | Vision (Path B) | 1M tokens | Fast | Generous Daily Free Tier (15 RPM / 1500 RPD) | Bulk PDF page analysis, OCR backup when OpenRouter balance is low |
| **Ollama** *(Offline Vision)* | `qwen2.5-vl:7b` | Vision (Path B) | 32k tokens | Local GPU/CPU | 100% Free (Self-hosted) | Zero-internet offline extraction |
| **Groq** *(Primary Text)* | `llama-3.3-70b-versatile` | Text (Path A) | 128k tokens | Ultra-Fast (500+ t/s) | Free Tier (30 RPM / 6000 TPM) | Direct text extraction from digital PDF layers |
| **Groq** *(Fast Text)* | `llama-3.1-8b-instant` | Text (Path A) | 128k tokens | Blazing (750+ t/s) | Free Tier | Rapid single-question classification and cleanup |

---

## 3. When to Use Each Provider

### A. When to Use Groq (Text Path A)
* **Use for:** Clean digital PDFs (e.g., official SSC CHSL master question papers with selectable text).
* **Why:** Groq provides ultra-fast inference (500+ tokens/sec) at zero cost on its free tier.
* **Limitation:** Groq does **not** process raw image inputs directly in our pipeline. Groq is restricted to **Text Pages only**.

### B. When to Use OpenRouter Qwen2.5-VL (Vision Path B - Primary)
* **Use for:** Scanned PYQs, watermarked exam pages, double-column layouts, math symbols, and diagram-dependent questions.
* **Why:** Qwen 2.5-VL is ranked among the top open-weights vision models in the world. It excels at reading complex Indian competitive exam layouts.
* **Rule:** Always set `max_tokens` (e.g., `4096`) in the API call to avoid 402 buffer reservation errors.

### C. When to Use Google Gemini 2.0 Flash (Vision Path B - Fallback)
* **Use for:** Failover if OpenRouter experiences latency, rate limits, or account balance depletion.
* **Why:** Google's Gemini API offers a high-capacity free tier (1,500 requests per day) with native image ingestion.

### D. When to Use Ollama (Offline / Local Fallback)
* **Use for:** Development on local machines with dedicated GPUs (NVIDIA RTX 3060+) or when offline.
* **Setup:** `ollama run qwen2.5-vl:7b`.

---

## 4. Environment Configuration (`.env`)

```env
# ============================================================
# VISION PROVIDER (Path B - Scanned / Image Pages)
# ============================================================
# Switch providers with one variable: 'openrouter' | 'gemini' | 'ollama'
VISION_PROVIDER=openrouter

# 1. OpenRouter (Primary Vision)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_VISION_MODEL=qwen/qwen-2.5-vl-7b-instruct
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

# 2. Google Gemini (Fallback Vision)
GEMINI_API_KEY=AIzaSy...
GEMINI_VISION_MODEL=gemini-2.0-flash

# 3. Ollama (Local Offline Vision)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=qwen2.5-vl:7b

# ============================================================
# TEXT PROVIDER (Path A - Text-Layer Pages Only)
# ============================================================
# Switch providers: 'groq' | 'openrouter' | 'ollama'
TEXT_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_TEXT_MODEL=llama-3.3-70b-versatile
```

---

## 5. Pros & Cons Analysis

### 1. OpenRouter (Qwen2.5-VL / GPT-4o-Mini)
* **Pros:**
  * Universal OpenAI-compatible API endpoint (`https://openrouter.ai/api/v1/chat/completions`).
  * Access to state-of-the-art vision models without managing GPU infrastructure.
  * Robust JSON formatting compliance with `temperature: 0`.
* **Cons:**
  * Requires setting explicit `max_tokens` to avoid credit reservation 402 errors.

### 2. Google Gemini 2.0 Flash
* **Pros:**
  * Generous 1,500 daily requests free tier.
  * Massive context window (1M tokens).
  * Fast image processing latency (< 2.5s per page).
* **Cons:**
  * Rate-limited to 15 RPM on free tier (handled by our 4s inter-page throttle).

### 3. Groq (Llama 3.3 70B / 8B)
* **Pros:**
  * Fastest inference on LPU chips (500+ tokens/sec).
  * Free tier with high daily throughput for text.
* **Cons:**
  * Text-only in our pipeline (cannot take base64 image inputs).

---

## 6. Project Recommended Default

| Role | Configured Provider | Model |
|------|---------------------|-------|
| **Primary Vision Extractor** | OpenRouter | `qwen/qwen-2.5-vl-7b-instruct` |
| **Fallback Vision Extractor** | Google Gemini | `gemini-2.0-flash` |
| **Offline Local Extractor** | Ollama | `qwen2.5-vl:7b` |
| **Primary Text Extractor** | Groq | `llama-3.3-70b-versatile` |

---

## 7. Operational Rules for Developers & Agents

1. **Never Hardcode Model Names:** Read from `process.env.OPENROUTER_VISION_MODEL`, `process.env.GEMINI_VISION_MODEL`, `process.env.GROQ_TEXT_MODEL`.
2. **Deterministic Extraction:** Always set `temperature: 0`.
3. **Explicit Token Limits:** Always send `max_tokens: 4096` for vision extraction requests.
4. **Retry on Invalid JSON:** Strip markdown fences, attempt `JSON.parse()`, and trigger a one-shot repair prompt if malformed.
5. **Log Telemetry:** Record `{ page, provider, model, latencyMs, questionsExtracted }` in `data/logs/extraction_telemetry.json`.
