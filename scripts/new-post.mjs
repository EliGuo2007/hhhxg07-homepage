import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsPath = path.resolve(__dirname, "../src/data/posts.json");

const args = process.argv.slice(2);
const title = args.find((arg) => !arg.startsWith("--"));
const tagArg = args.find((arg) => arg.startsWith("--tag="));
const tag = tagArg ? tagArg.slice("--tag=".length) : "Notes";

if (!title) {
  console.error('Usage: npm run new:post -- "Post Title" --tag=Notes');
  process.exit(1);
}

const slug = title
  .trim()
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 80);

if (!slug) {
  console.error("Could not create a slug from this title.");
  process.exit(1);
}

const now = new Date();
const date = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join(".");

const posts = JSON.parse(await readFile(postsPath, "utf8"));

if (posts.some((post) => post.slug === slug)) {
  console.error(`Post slug already exists: ${slug}`);
  process.exit(1);
}

posts.unshift({
  slug,
  title,
  date,
  tag,
  summary: "Write a short summary shown on the homepage.",
  readingTime: "3 min read",
  content: [
    {
      type: "paragraph",
      text: "Write the opening paragraph here.",
    },
    {
      type: "heading",
      text: "Section title",
    },
    {
      type: "paragraph",
      text: "Write the section body here.",
    },
  ],
});

await writeFile(postsPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

console.log(`Created post: ${title}`);
console.log(`Slug: ${slug}`);
console.log(`URL: http://127.0.0.1:5173/#/post/${slug}`);
