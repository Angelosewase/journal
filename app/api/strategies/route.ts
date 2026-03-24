import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STRATEGIES_DIR = path.join(process.cwd(), "strategy-docs");

function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const file = searchParams.get("file");

  try {
    if (!fs.existsSync(STRATEGIES_DIR)) {
      fs.mkdirSync(STRATEGIES_DIR, { recursive: true });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body as { title?: string; content?: string };

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const sanitized = sanitizeFilename(title);
    if (!sanitized) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    if (!fs.existsSync(STRATEGIES_DIR)) {
      fs.mkdirSync(STRATEGIES_DIR, { recursive: true });
    }

    let fileName = `${sanitized}.md`;
    let filePath = path.join(STRATEGIES_DIR, fileName);
    let counter = 1;

    while (fs.existsSync(filePath)) {
      fileName = `${sanitized}_${counter}.md`;
      filePath = path.join(STRATEGIES_DIR, fileName);
      counter++;
    }

    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({
      success: true,
      file: { name: fileName, slug: fileName.replace(/\.md$/, "") },
    });
  } catch {
    return NextResponse.json({ error: "Failed to save strategy" }, { status: 500 });
  }
}
