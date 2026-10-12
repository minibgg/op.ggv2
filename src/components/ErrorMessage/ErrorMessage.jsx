import { Link } from "react-router-dom";
import { canRetry, getErrorText } from "./errorText.js";

export function ErrorMessage({ error, onRetry }) {
  return (
    <div role="alert">
      <h2>{getErrorText(error)}</h2>
      {canRetry(error) && onRetry && <button onClick={onRetry}>Retry</button>}
      <Link to="/">Home</Link>
    </div>
  );
}
