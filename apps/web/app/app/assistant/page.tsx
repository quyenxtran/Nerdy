import { AssistantChat } from "@/components/AssistantChat";
import { AppShell } from "@/components/AppShell";

export default function AssistantPage() {
  return (
    <AppShell active="assistant">
      <header className="topbar">
        <div>
          <p className="eyebrow">Cited chat skeleton</p>
          <h2>Assistant</h2>
        </div>
      </header>
      <AssistantChat />
    </AppShell>
  );
}
