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
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const FURINA_CHIBI_IMAGE_URL = "/assets/furina-mascot-wave.png";

const mascotLineGroups = {
  morning: [
    "早安。今天的开场白已经准备好了，轮到你写下第一行灵感。",
    "晨光正好，适合把待办事项排成一场漂亮的审判。",
    "新的篇章已经开幕，不许用拖延当作辩词哦。",
  ],
  afternoon: [
    "午后的思路最适合梳理成目录，清晰就是优雅。",
    "如果代码开始沉默，那就给它一点耐心和一杯水。",
    "现在是推进进度的好时机，把想法大胆发布出来吧。",
  ],
  evening: [
    "夜幕前的复盘很重要，今日的证据请整理成博客。",
    "讨论区正在亮灯，任何好问题都值得登上舞台。",
    "傍晚适合修改措辞，让观点像聚光灯一样准确。",
  ],
  night: [
    "深夜场开始。灵感可以晚到，但不要忘记保存。",
    "若你还在调试，那我宣布：坚持本身也应获得掌声。",
    "夜色很安静，正适合把复杂问题写成清楚的答案。",
  ],
};

function getMascotPeriod(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

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
        level: block.level || inferHeadingLevel(block.text),
        text: block.text,
      };
    })
    .filter(Boolean);
}

function inferHeadingLevel(text) {
  if (/^(题目[一二三四五六七八九十]|总结|两个样例)/.test(text)) return 2;
  return 3;
}

function PostToc({ items }) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    if (items.length === 0) return undefined;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (headings.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -64% 0px",
        threshold: [0, 0.1, 0.6],
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToSection = (id) => {
    setActiveId(id);
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
          <button
            className={item.id === activeId ? "active" : ""}
            data-level={item.level}
            type="button"
            key={item.id}
            onClick={() => scrollToSection(item.id)}
          >
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
    const HeadingTag = (block.level || inferHeadingLevel(block.text)) >= 3 ? "h3" : "h2";

    return (
      <HeadingTag className="post-body-heading" id={getHeadingId(index)}>
        {block.text}
      </HeadingTag>
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

function FurinaMascot() {
  const [hidden, setHidden] = useState(() => {
    return window.localStorage.getItem("hhhxg07_furina_hidden") === "true";
  });
  const [period, setPeriod] = useState(() => getMascotPeriod());
  const [lineIndex, setLineIndex] = useState(0);
  const [action, setAction] = useState("idle");
  const actionTimeoutRef = useRef(null);
  const actionFrameRef = useRef(null);
  const lines = mascotLineGroups[period];

  const triggerAction = (nextAction = "wave") => {
    if (actionTimeoutRef.current) {
      window.clearTimeout(actionTimeoutRef.current);
    }
    if (actionFrameRef.current) {
      window.cancelAnimationFrame(actionFrameRef.current);
    }

    setAction("idle");
    actionFrameRef.current = window.requestAnimationFrame(() => {
      setAction(nextAction);
      actionTimeoutRef.current = window.setTimeout(() => setAction("idle"), 1200);
    });
  };

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) window.clearTimeout(actionTimeoutRef.current);
      if (actionFrameRef.current) window.cancelAnimationFrame(actionFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (hidden) return undefined;

    const timer = window.setInterval(() => {
      const nextPeriod = getMascotPeriod();
      setPeriod(nextPeriod);
      setLineIndex((index) => (index + 1) % mascotLineGroups[nextPeriod].length);
      triggerAction("idle-talk");
    }, 45000);

    return () => window.clearInterval(timer);
  }, [hidden]);

  const speak = () => {
    const nextPeriod = getMascotPeriod();
    setPeriod(nextPeriod);
    setLineIndex((index) => (index + 1) % mascotLineGroups[nextPeriod].length);
    triggerAction("wave");
  };

  const close = () => {
    window.localStorage.setItem("hhhxg07_furina_hidden", "true");
    setAction("idle");
    setHidden(true);
  };

  const show = () => {
    window.localStorage.setItem("hhhxg07_furina_hidden", "false");
    setPeriod(getMascotPeriod());
    setLineIndex(0);
    setHidden(false);
    triggerAction("wave");
  };

  if (hidden) {
    return (
      <button className="mascot-return" type="button" onClick={show}>
        Show Companion
      </button>
    );
  }

  return (
    <aside className={`mascot action-${action}`} aria-label="Mascot companion">
      <button className="mascot-close" type="button" onClick={close} aria-label="Close mascot companion">
        <X size={15} aria-hidden="true" />
      </button>
      <button className="mascot-stage" type="button" onClick={speak} aria-label="Talk with mascot companion">
        <span className="mascot-figure" aria-hidden="true">
          <img className="mascot-image" src={FURINA_CHIBI_IMAGE_URL} alt="" draggable="false" />
        </span>
      </button>
      <div className="mascot-bubble">
        <p>{lines[lineIndex]}</p>
      </div>
    </aside>
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
      <FurinaMascot />
      <Footer />
    </>
  );
}
