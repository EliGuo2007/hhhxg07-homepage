import {
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  Cpu,
  Github,
  Mail,
  MessageSquare,
  Radio,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BlogComments, DiscussionPage, useSession } from "./components/Community";
import posts from "./data/posts.json";

function scrollToHashTarget(hash) {
  if (hash === "#/" || hash.startsWith("#/post/") || hash === "#/discuss") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const target = document.getElementById(hash.slice(1));
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const signals = [
  ["Current focus", "Static publishing, local-first notes, UI craft"],
  ["Stack", "React, Vite, Markdown, edge hosting"],
  ["Frequency", "Slow blog, fast notes, occasional experiments"],
];

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="hhhxg07 home">
        <span className="brand-mark">h</span>
        <span>hhhxg07</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#/">Home</a>
        <a href="#blog">Blog</a>
        <a href="#/discuss">Discuss</a>
        <a href="#notes">Notes</a>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="hero section-band">
      <div className="hero-bg" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="hero-grid">
        <div className="hero-copy">
          <h1>hhhxg07</h1>
          <p>building systems, stories, and small neon experiments</p>
          <div className="hero-actions">
            <a className="button primary" href="#blog">
              <BookOpen size={18} aria-hidden="true" />
              <span>Read Blog</span>
            </a>
            <a className="button secondary" href="#about">
              <Sparkles size={18} aria-hidden="true" />
              <span>About Me</span>
            </a>
            <a className="button tertiary" href="#/discuss">
              <MessageSquare size={18} aria-hidden="true" />
              <span>Discuss</span>
            </a>
          </div>
        </div>

        <div className="terminal-panel" aria-label="site status terminal">
          <div className="terminal-top">
            <span />
            <span />
            <span />
          </div>
          <div className="terminal-body">
            <p>
              <Terminal size={16} aria-hidden="true" />
              booting hhhxg07.space
            </p>
            <p>
              <Cpu size={16} aria-hidden="true" />
              compiling thoughts
            </p>
            <p>
              <Radio size={16} aria-hidden="true" />
              signal online
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogPreview() {
  return (
    <section id="blog" className="section-band blog-section">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Featured Posts</h2>
          <a href="#notes" className="text-link">
            View notes <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="post-list">
          {posts.map((post) => (
            <article className="post-card" key={post.title}>
              <div className="post-meta">
                <span>{post.date}</span>
                <span>{post.tag}</span>
              </div>
              <div>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
              </div>
              <a
                className="icon-button"
                href={`#/post/${post.slug}`}
                aria-label={`Read ${post.title}`}
              >
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPost({ post, session }) {
  const tocItems = getTableOfContents(post);

  return (
    <article className="post-page">
      <div className="noise" aria-hidden="true" />
      <div className="post-layout">
        <PostToc items={tocItems} />
        <div className="post-shell">
          <a className="back-link" href="#blog">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to posts
          </a>
          <div className="post-page-meta">
            <span>{post.date}</span>
            <span>{post.tag}</span>
            <span>{post.readingTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p className="post-lead">{post.summary}</p>
          <div className="post-body">
            {post.content.map((block, index) => (
              <PostBlock block={block} index={index} key={`${post.slug}-${index}`} />
            ))}
          </div>
          <BlogComments postSlug={post.slug} session={session} />
        </div>
      </div>
    </article>
  );
}

function getHeadingId(index) {
  return `section-${index}`;
}

function getTableOfContents(post) {
  return post.content
    .map((block, index) => {
      if (typeof block === "string" || block.type !== "heading") return null;
      return {
        id: getHeadingId(index),
        text: block.text,
      };
    })
    .filter(Boolean);
}

function PostToc({ items }) {
  if (items.length === 0) return null;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <aside className="post-toc" aria-label="Article table of contents">
      <span>Contents</span>
      <nav>
        {items.map((item) => (
          <button type="button" key={item.id} onClick={() => scrollToSection(item.id)}>
            {item.text}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function PostBlock({ block, index }) {
  if (typeof block === "string") return <p>{block}</p>;

  if (block.type === "heading") {
    return (
      <h2 className="post-body-heading" id={getHeadingId(index)}>
        {block.text}
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="post-body-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="post-code">
        <code>{block.text}</code>
      </pre>
    );
  }

  return <p>{block.text}</p>;
}

function NotFoundPost() {
  return (
    <section className="post-page">
      <div className="post-shell">
        <a className="back-link" href="#blog">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to posts
        </a>
        <h1>Post not found</h1>
        <p className="post-lead">
          The signal exists, but this article slug does not. Pick another post
          from the homepage.
        </p>
      </div>
    </section>
  );
}

function NotesAndAbout() {
  return (
    <section id="about" className="section-band about-section">
      <div className="section-shell about-grid">
        <div className="about-copy">
          <h2>About hhhxg07</h2>
          <p>
            I use this space to publish technical notes, personal essays, and
            small interface experiments. The site starts static on purpose:
            fast to load, easy to deploy, and simple enough to keep writing.
          </p>
        </div>
        <div id="notes" className="signal-board">
          {signals.map(([label, value]) => (
            <div className="signal-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Zap size={18} aria-hidden="true" />
        <span>hhhxg07</span>
      </div>
      <div className="footer-links">
        <a href="https://github.com/EliGuo2007" target="_blank" rel="noreferrer">
          <Github size={17} aria-hidden="true" />
          GitHub
        </a>
        <span className="footer-contact">
          <Mail size={17} aria-hidden="true" />
          guohanxing@outlook.com
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  const session = useSession();
  const isDiscussionPage = hash === "#/discuss";
  const currentPost = useMemo(() => {
    const match = hash.match(/^#\/post\/([^/]+)$/);
    if (!match) return null;
    return posts.find((post) => post.slug === match[1]) || "missing";
  }, [hash]);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || "#/");
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onLinkClick = (event) => {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const nextHash = new URL(link.href).hash;
      if (!nextHash) return;
      if (nextHash.startsWith("#/post/") || nextHash === "#/discuss") return;

      event.preventDefault();

      if (window.location.hash === nextHash) {
        setHash(nextHash);
        scrollToHashTarget(nextHash);
        return;
      }

      window.location.hash = nextHash;
    };

    document.addEventListener("click", onLinkClick);
    return () => document.removeEventListener("click", onLinkClick);
  }, []);

  useEffect(() => {
    scrollToHashTarget(hash);
  }, [hash]);

  return (
    <>
      <Header />
      {isDiscussionPage ? (
        <main>
          <DiscussionPage session={session} />
        </main>
      ) : currentPost ? (
        <main>
          {currentPost === "missing" ? (
            <NotFoundPost />
          ) : (
            <BlogPost post={currentPost} session={session} />
          )}
        </main>
      ) : (
        <main>
          <Hero />
          <BlogPreview />
          <NotesAndAbout />
        </main>
      )}
      <Footer />
    </>
  );
}
