export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="loading-wrap">
      <div className="spinner" role="status" aria-label={label} />
    </div>
  );
}
