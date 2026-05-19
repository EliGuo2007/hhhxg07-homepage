# hhhxg07 Homepage

Cyberpunk-style static personal homepage and blog shell for `hhhxg07`.

## Local Development

```bash
npm install
npm run dev
```

The dev server defaults to `http://127.0.0.1:5173`.

## Production Build

```bash
npm run build
```

The static output is generated in `dist/`.

## Publish A New Blog Post

Posts currently live in `src/data/posts.json`.

Fast path:

```bash
npm run new:post -- "My First Real Post" --tag=Notes
```

This command creates a new post template at the top of `src/data/posts.json`
and prints its local URL.

Manual path:

1. Add a new object to the top of the `posts` array.
2. Give it a unique `slug`, for example `my-first-real-post`.
3. Fill in `title`, `date`, `tag`, `summary`, `readingTime`, and `content`.
4. Each item inside `content` can be a paragraph string or a structured block.
5. Run `npm run build` to verify the site still builds.

Example:

```js
{
  slug: "my-first-real-post",
  title: "My First Real Post",
  date: "2026.05.19",
  tag: "Notes",
  summary: "A short summary shown on the homepage.",
  readingTime: "3 min read",
  content: [
    "The first paragraph of the article.",
    { type: "heading", text: "Section title" },
    {
      type: "list",
      items: ["First point.", "Second point."]
    },
    {
      type: "code",
      language: "js",
      text: "console.log('hello hhhxg07');"
    }
  ],
}
```

After saving, the post is available at:

```text
http://127.0.0.1:5173/#/post/my-first-real-post
```

This uses hash routing (`#/post/...`) so it works on static hosting without
extra server rewrite configuration.

## Deploy To The Internet

Recommended path:

1. Push this project to a GitHub repository.
2. Import the repository into Vercel, Netlify, or Cloudflare Pages.
3. Use these settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Buy a domain from Cloudflare Registrar, Namecheap, Porkbun, or another registrar.
5. In the hosting platform, add your custom domain.
6. In the domain registrar DNS panel, follow the hosting platform's instructions:
   - Usually add a `CNAME` record for `www`.
   - Usually add an `A`, `AAAA`, or flattened `CNAME` record for the root domain.
7. Wait for DNS and SSL certificate activation.

Good first domain ideas: `hhhxg07.com`, `hhhxg07.dev`, `hhhxg07.me`, or `hhhxg07.blog`.
