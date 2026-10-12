import { Link } from "react-router-dom";

const MESSAGES = {
  NOT_FOUND: "Player not found. Check the name, tag and region.",
  BAD_KEY: "Problem with the API key. It may have expired.",
  RATE_LIMIT: "Too many requests. Wait a minute and try again.",
  NETWORK: "No connection, or the server is not responding.",
  SERVER: "Riot server error. Try again later.",
};

export function ErrorMessage({ error, onRetry }) {
  const text = MESSAGES[error.kind] ?? "Something went wrong.";

  return (
    <div role="alert">
      <h2>{text}</h2>
      {error.kind !== "NOT_FOUND" && onRetry && (
        <button onClick={onRetry}>Retry</button>
      )}
      <Link to="/">Home</Link>
    </div>
  );
}
