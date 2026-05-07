import {
  BadgeCheck,
  Brain,
  Database,
  FileText,
  GitBranch,
  MessageSquare,
  Network,
  NotebookText,
  Sparkles,
  UserRound
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/app", label: "Cockpit", icon: BadgeCheck },
  { href: "/app/feed", label: "Feed", icon: Sparkles },
  { href: "/app/papers/shape-descriptors-loao", label: "Paper", icon: FileText },
  { href: "/app/graph", label: "Graph", icon: GitBranch },
  { href: "/app/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/app/thesis-validator", label: "Thesis", icon: Brain },
  { href: "/app/memo", label: "Memo", icon: NotebookText },
  { href: "/app/debug", label: "Debug", icon: Database },
  { href: "/app/profile", label: "Profile", icon: UserRound }
];

export function AppShell({ children, active }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Network size={22} />
          </span>
          <span>
            <strong>PaperGraph AI</strong>
            <span>Research graph cockpit</span>
          </span>
        </Link>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label.toLowerCase();

            return (
              <Link className={isActive ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                <span>{item.label}</span>
                <Icon size={16} />
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
