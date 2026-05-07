import Link from "next/link";
import { notFound } from "next/navigation";
import { sharePosts } from "@/lib/mock-data";
import { getRepost } from "@/lib/services";

export default async function SharePage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post =
    sharePosts.find((item) => item.id === postId) ??
    (() => {
      try {
        return getRepost(postId).repost;
      } catch {
        return undefined;
      }
    })();

  if (!post) {
    notFound();
  }

  return (
    <main className="main">
      <section className="hero" style={{ minHeight: "90vh" }}>
        <div className="hero-copy">
          <span className="eyebrow">{post.author} reposted a paper</span>
          <h1>{post.paper.title}</h1>
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
