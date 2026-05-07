import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicRepost } from "@/lib/services";

export default async function SharePage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const result = (() => {
    try {
      return getPublicRepost(postId);
    } catch {
      return undefined;
    }
  })();

  if (!result) {
    notFound();
  }

  const { repost: post, visibility } = result;

  return (
    <main className="main">
      <section className="hero" style={{ minHeight: "90vh" }}>
        <div className="hero-copy">
          <span className="eyebrow">{post.author} reposted a paper</span>
          <h1>{post.paper.title}</h1>
          {visibility.action !== "allow" ? (
            <span className="metric-pill">{visibility.label}: {visibility.reason}</span>
          ) : null}
          <p className="lead">{post.note}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/app">
              Save to PaperGraph
            </Link>
            <Link className="button" href={`/app/assistant?paper=${post.paper.id}`}>
              Ask AI about this paper
            </Link>
          </div>
        </div>
        <aside className="workspace-card">
          <div className="score">
            <strong>{post.paper.relevance}</strong>
            <span>match</span>
          </div>
          <p className="body-copy">{post.paper.takeaway}</p>
          <div className="tag-row">
            {post.paper.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
