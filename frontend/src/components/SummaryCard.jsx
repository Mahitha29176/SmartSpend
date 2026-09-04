export default function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <div className="label">{label}</div>
      <div className="value figure">{value}</div>
    </div>
  );
}
