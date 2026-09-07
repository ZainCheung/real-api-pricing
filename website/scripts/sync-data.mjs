import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const websiteRoot = join(__dirname, "..");
const repoRoot = join(websiteRoot, "..");
const publicData = join(websiteRoot, "public", "data");

const copies = [
  {
    src: join(repoRoot, "derived", "points.json"),
    dest: join(publicData, "points.json"),
  },
  {
    src: join(repoRoot, "derived", "points.csv"),
    dest: join(publicData, "points.csv"),
  },
  {
    src: join(repoRoot, "data", "adopted.csv"),
    dest: join(publicData, "adopted.csv"),
  },
];

mkdirSync(publicData, { recursive: true });

let missing = false;
for (const { src, dest } of copies) {
  if (!existsSync(src)) {
    console.error(`Missing source: ${src}`);
    missing = true;
    continue;
  }
  copyFileSync(src, dest);
  console.log(`Copied ${src} → ${dest}`);
}

if (missing) {
  process.exit(1);
}
