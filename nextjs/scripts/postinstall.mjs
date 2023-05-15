import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function main() {
  const infoPath = path.join(
    __dirname,
    "../",
    "src",
    "server",
    "api",
    "routers",
    "info",
    "index.ts"
  );
  const content = await fs.readFile(infoPath, "utf-8");
  const newContent = content
    .replace(`model: "gpt-4"`, `model: "gpt-3.5-turbo-0301"`)
    .replace(`// max_tokens: 1500`, "max_tokens: 1500")
    .replace("chunks = chunks.slice(0, 8)", "chunks = chunks.slice(0, 5)");
  await fs.writeFile(infoPath, newContent, "utf-8");
}

main();
