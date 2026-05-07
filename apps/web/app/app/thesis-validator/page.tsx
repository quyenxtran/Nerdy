import { AppShell } from "@/components/AppShell";
import { ThesisValidationForm } from "@/components/ThesisValidationForm";

export default function ThesisValidatorPage() {
  return (
    <AppShell active="thesis">
      <header className="topbar">
        <div>
          <p className="eyebrow">Novelty and overlap</p>
          <h2>Thesis validator</h2>
        </div>
      </header>
      <ThesisValidationForm />
    </AppShell>
  );
}
