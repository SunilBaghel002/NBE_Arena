import crypto from "crypto";

export function generateQuestionHash(
  questionText: string,
  options: { a: string; b: string; c: string; d: string }
): string {
  const normalize = (str: string = "") =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normQ = normalize(questionText);
  const normOpts = [options.a, options.b, options.c, options.d]
    .map(normalize)
    .sort()
    .join("::");

  const payload = `${normQ}###${normOpts}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}
