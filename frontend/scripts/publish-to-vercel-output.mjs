#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Only run on CI/Vercel. Locally it's harmless but we guard anyway.
const isCI = !!process.env.CI || !!process.env.VERCEL;
const dist = join(__dirname, "..", "dist");
// From frontend/scripts/ -> repo root is ../../
const out = join(__dirname, "..", "..", ".vercel", "output", "static");

// Guard: only run if dist exists
if (!existsSync(dist)) {
  console.error("❌ dist directory does not exist! Build may have failed.");
  process.exit(1);
}

try {
  // Create output directory structure
  mkdirSync(out, { recursive: true });
  
  // Copy dist → .vercel/output/static (recursive)
  cpSync(dist, out, { recursive: true });
  
  // Log tree for visibility
  console.log("\n--- .vercel/output/static contents ---");
  const files = readdirSync(out);
  files.forEach(file => {
    const filePath = join(out, file);
    const stats = statSync(filePath);
    const size = stats.isDirectory() ? "<DIR>" : `${(stats.size / 1024).toFixed(2)} KB`;
    console.log(`${stats.isDirectory() ? "d" : "-"} ${file.padEnd(30)} ${size}`);
  });
  
  console.log("\n✅ Published dist to .vercel/output/static");
} catch (e) {
  console.error("❌ Publish to .vercel/output/static failed:", e.message);
  process.exit(1);
}
