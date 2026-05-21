import {
  LogIn,
  LogOut,
  MessageCircle,
  MessageSquare,
  Send,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDisplayName, isSupabaseConfigured, supabase } from "../lib/supabase";

function AuthPanel({ session }) {
  const signIn = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.href,
      },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="community-auth">
        <UserRound size={18} aria-hidden="true" />
        <span>Community features are ready in code. Connect Supabase to enable login and posting.</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="community-auth">
        <span>Visitors can read. Sign in with GitHub to post and reply.</span>
        <button className="mini-button" type="button" onClick={signIn}>
          <LogIn size={16} aria-hidden="true" />
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="community-auth">
      <span>Signed in as {getDisplayName(session.user)}</span>
      <button className="mini-button" type="button" onClick={signOut}>
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

function Composer({ label, placeholder, disabled, onSubmit, compact = false }) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || disabled || pending) return;

    setPending(true);
    try {
      await onSubmit(text);
      setBody("");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={compact ? "composer compact" : "composer"} onSubmit={submit}>
      <label>
        <span>{label}</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          disabled={disabled || pending}
          rows={compact ? 3 : 5}
        />
      </label>
      <button className="button primary" type="submit" disabled={disabled || pending || !body.trim()}>
        <Send size={16} aria-hidden="true" />
        {pending ? "Sending" : "Post"}
      </button>
    </form>
  );
}

function EmptyState({ children }) {
  return (
    <div className="community-empty">
      <MessageCircle size={20} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function CommentItem({ comment, session, onReply }) {
  const [replying, setReplying] = useState(false);

  return (
    <article className={comment.parent_id ? "comment reply" : "comment"}>
      <div className="comment-meta">
        <strong>{comment.author_name}</strong>
        <span>{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      <p>{comment.body}</p>
      {!comment.parent_id && (
        <button className="text-button" type="button" onClick={() => setReplying((value) => !value)}>
          Reply
        </button>
      )}
      {replying && (
        <Composer
          compact
          label="Reply"
          placeholder={session ? "Write a reply..." : "Sign in to reply."}
          disabled={!session}
          onSubmit={async (body) => {
            await onReply(comment.id, body);
            setReplying(false);
          }}
        />
      )}
    </article>
  );
}

export function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}

export function BlogComments({ postSlug, session }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_slug", postSlug)
      .order("created_at", { ascending: true });

    setError(loadError?.message || "");
    setComments(data || []);
    setLoading(false);
  }, [postSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (body, parentId = null) => {
    if (!supabase || !session) return;

    const { error: insertError } = await supabase.from("comments").insert({
      post_slug: postSlug,
      parent_id: parentId,
      body,
      author_name: getDisplayName(session.user),
      user_id: session.user.id,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await loadComments();
  };

  const roots = useMemo(
    () => comments.filter((comment) => !comment.parent_id),
    [comments],
  );
  const repliesByParent = useMemo(() => {
    return comments.reduce((map, comment) => {
      if (!comment.parent_id) return map;
      map[comment.parent_id] = [...(map[comment.parent_id] || []), comment];
      return map;
    }, {});
  }, [comments]);

  return (
    <section className="community-section">
      <div className="community-heading">
        <div>
          <h2>Comments</h2>
          <p>Read freely. Sign in to join the thread.</p>
        </div>
        <AuthPanel session={session} />
      </div>

      <Composer
        label="New comment"
        placeholder={session ? "Share your thought on this post..." : "Sign in with GitHub to comment."}
        disabled={!session || !isSupabaseConfigured}
        onSubmit={(body) => addComment(body)}
      />

      {error && <p className="community-error">{error}</p>}
      {loading && <EmptyState>Loading comments...</EmptyState>}
      {!loading && roots.length === 0 && <EmptyState>No comments yet.</EmptyState>}
      <div className="comment-list">
        {roots.map((comment) => (
          <div className="comment-thread" key={comment.id}>
            <CommentItem comment={comment} session={session} onReply={addComment} />
            {(repliesByParent[comment.id] || []).map((reply) => (
              <CommentItem comment={reply} key={reply.id} session={session} onReply={addComment} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DiscussionPage({ session }) {
  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [replies, setReplies] = useState([]);
  const [topicTitle, setTopicTitle] = useState("");
  const [error, setError] = useState("");

  const activeTopic = topics.find((topic) => topic.id === activeTopicId);

  const loadTopics = useCallback(async () => {
    if (!supabase) return;

    const { data, error: loadError } = await supabase
      .from("discussion_topics")
      .select("*")
      .order("created_at", { ascending: false });

    setError(loadError?.message || "");
    setTopics(data || []);
    if (!activeTopicId && data?.length) setActiveTopicId(data[0].id);
  }, [activeTopicId]);

  const loadReplies = useCallback(async () => {
    if (!supabase || !activeTopicId) {
      setReplies([]);
      return;
    }

    const { data, error: loadError } = await supabase
      .from("discussion_replies")
      .select("*")
      .eq("topic_id", activeTopicId)
      .order("created_at", { ascending: true });

    setError(loadError?.message || "");
    setReplies(data || []);
  }, [activeTopicId]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    loadReplies();
  }, [loadReplies]);

  const createTopic = async (body) => {
    if (!supabase || !session) return;
    const title = topicTitle.trim();
    if (!title) {
      setError("Please add a discussion title.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("discussion_topics")
      .insert({
        title,
        body,
        author_name: getDisplayName(session.user),
        user_id: session.user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTopicTitle("");
    await loadTopics();
    setActiveTopicId(data.id);
  };

  const createReply = async (body) => {
    if (!supabase || !session || !activeTopicId) return;

    const { error: insertError } = await supabase.from("discussion_replies").insert({
      topic_id: activeTopicId,
      body,
      author_name: getDisplayName(session.user),
      user_id: session.user.id,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await loadReplies();
  };

  return (
    <section className="discussion-page">
      <div className="noise" aria-hidden="true" />
      <div className="discussion-shell">
        <div className="discussion-hero">
          <h1>Discussion</h1>
          <p>Open threads for algorithms, site ideas, and whatever deserves a neon workbench.</p>
          <AuthPanel session={session} />
        </div>

        {!isSupabaseConfigured && (
          <EmptyState>Connect Supabase environment variables to enable live discussion.</EmptyState>
        )}
        {error && <p className="community-error">{error}</p>}

        <div className="discussion-grid">
          <aside className="topic-list" aria-label="Discussion topics">
            <div className="topic-list-header">
              <MessageSquare size={18} aria-hidden="true" />
              <span>Threads</span>
            </div>
            {topics.length === 0 && <EmptyState>No threads yet.</EmptyState>}
            {topics.map((topic) => (
              <button
                className={topic.id === activeTopicId ? "topic-item active" : "topic-item"}
                key={topic.id}
                type="button"
                onClick={() => setActiveTopicId(topic.id)}
              >
                <strong>{topic.title}</strong>
                <span>{topic.author_name}</span>
              </button>
            ))}
          </aside>

          <div className="topic-panel">
            <div className="new-topic">
              <label>
                <span>New thread title</span>
                <input
                  value={topicTitle}
                  onChange={(event) => setTopicTitle(event.target.value)}
                  placeholder={session ? "What should we discuss?" : "Sign in to start a thread."}
                  disabled={!session || !isSupabaseConfigured}
                />
              </label>
              <Composer
                label="Opening post"
                placeholder={session ? "Write the opening question or idea..." : "Sign in to start a thread."}
                disabled={!session || !isSupabaseConfigured}
                onSubmit={createTopic}
              />
            </div>

            {activeTopic && (
              <article className="active-topic">
                <div className="comment-meta">
                  <strong>{activeTopic.title}</strong>
                  <span>{activeTopic.author_name}</span>
                </div>
                <p>{activeTopic.body}</p>
              </article>
            )}

            <div className="comment-list">
              {replies.map((reply) => (
                <CommentItem comment={reply} key={reply.id} session={session} onReply={() => {}} />
              ))}
            </div>

            {activeTopic && (
              <Composer
                compact
                label="Reply to thread"
                placeholder={session ? "Add a reply..." : "Sign in to reply."}
                disabled={!session || !isSupabaseConfigured}
                onSubmit={createReply}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
