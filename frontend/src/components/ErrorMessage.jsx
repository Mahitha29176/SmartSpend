export default function ErrorMessage({ children }) {
  if (!children) return null;
  return <div className="banner-error">{children}</div>;
}
