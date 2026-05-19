# Deploy hhhxg07 Homepage With Cloudflare Pages

This project is a Vite static site. Recommended production stack:

- GitHub repository for source control
- Cloudflare Pages for hosting
- Cloudflare Registrar for domain registration
- Cloudflare DNS for custom domain routing

## 1. Local Checks

```bash
npm install
npm run build
```

Expected build output directory:

```text
dist
```

## 2. Push To GitHub

Create an empty GitHub repository, then run:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

Suggested repository name:

```text
hhhxg07-homepage
```

## 3. Create Cloudflare Pages Project

In the Cloudflare dashboard:

1. Go to `Workers & Pages`.
2. Select `Create application`.
3. Select `Pages`.
4. Select `Import from an existing Git repository`.
5. Connect GitHub and select this repository.
6. Use these build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Production branch: main
```

After deployment, Cloudflare gives you a URL like:

```text
https://hhhxg07-homepage.pages.dev
```

Every future `git push` to `main` will trigger a new deployment.

## 4. Buy A Domain With Cloudflare Registrar

In Cloudflare:

1. Go to `Domain Registration`.
2. Search for a domain, for example:
   - `hhhxg07.com`
   - `hhhxg07.dev`
   - `hhhxg07.me`
   - `hhhxg07.blog`
3. Pick an available domain.
4. Complete checkout.
5. Keep auto-renew enabled unless you explicitly do not want that.

## 5. Add Custom Domain To Pages

In your Pages project:

1. Go to `Custom domains`.
2. Select `Set up a domain`.
3. Add your root domain, for example:

```text
hhhxg07.com
```

4. Also add the `www` subdomain if you want it:

```text
www.hhhxg07.com
```

If the domain is registered or managed in Cloudflare, Cloudflare will usually
create the required DNS records automatically.

## 6. DNS Shape

Typical final DNS shape:

```text
hhhxg07.com      -> Cloudflare Pages project
www.hhhxg07.com  -> Cloudflare Pages project
```

Cloudflare Pages will handle HTTPS certificates automatically after DNS is
active.

## 7. Future Blog Release Flow

Create a new local post:

```bash
npm run new:post -- "New Post Title" --tag=Algorithms
```

Edit `src/data/posts.json`, then:

```bash
npm run build
git add .
git commit -m "Add new blog post"
git push
```

Cloudflare Pages will automatically rebuild and publish the new version.
