export function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <section className="metric-card">
      <strong>{value}</strong>
      <h3>{label}</h3>
      <p className="muted">{note}</p>
    </section>
  );
}
