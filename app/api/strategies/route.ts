import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STRATEGIES_DIR = path.join(process.cwd(), "strategy-docs");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const file = searchParams.get("file");

  try {
    if (!fs.existsSync(STRATEGIES_DIR)) {
      return NextResponse.json({ error: "Strategy docs directory not found" }, { status: 404 });
    }

    if (file) {
      const filePath = path.join(STRATEGIES_DIR, file);

      if (!filePath.startsWith(STRATEGIES_DIR)) {
        return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
      }

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content });
    }

    const files = fs.readdirSync(STRATEGIES_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({
        name: f,
        slug: f.replace(/\.md$/, ""),
      }));

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to read strategy docs" }, { status: 500 });
  }
}
