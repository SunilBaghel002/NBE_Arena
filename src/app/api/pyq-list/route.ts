import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const pyqRoot = path.join(process.cwd(), "data", "pyq");
    const resultList: { category: string; fileName: string; relativePath: string; sizeMb: string }[] = [];

    if (fs.existsSync(pyqRoot)) {
      const categories = fs.readdirSync(pyqRoot);
      for (const cat of categories) {
        const catPath = path.join(pyqRoot, cat);
        if (fs.statSync(catPath).isDirectory()) {
          const files = fs.readdirSync(catPath).filter((f) => f.toLowerCase().endsWith(".pdf"));
          for (const f of files) {
            const filePath = path.join(catPath, f);
            const stat = fs.statSync(filePath);
            resultList.push({
              category: cat.toUpperCase(),
              fileName: f,
              relativePath: path.relative(process.cwd(), filePath).replace(/\\/g, "/"),
              sizeMb: (stat.size / (1024 * 1024)).toFixed(1) + " MB",
            });
          }
        }
      }
    }

    return NextResponse.json({
      files: resultList,
      defaultVisionProvider: process.env.VISION_PROVIDER || "openrouter",
      defaultTextProvider: process.env.TEXT_PROVIDER || "groq",
      openrouterModel: process.env.OPENROUTER_VISION_MODEL || "qwen/qwen-2.5-vl-7b-instruct",
      groqModel: process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-120b",
      geminiModel: process.env.GEMINI_VISION_MODEL || "gemini-2.0-flash",
    });
  } catch (error) {
    console.error("PYQ List Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list PYQ files" },
      { status: 500 }
    );
  }
}
