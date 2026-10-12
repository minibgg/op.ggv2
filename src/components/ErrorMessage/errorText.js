// Тексты ошибок по error.kind — общие для ErrorMessage и панели загрузки LoadStatus
const MESSAGES = {
  NOT_FOUND: "Player not found. Check the name, tag and region.",
  BAD_REQUEST: "Invalid name or tag. Check how it's spelled.",
  BAD_KEY: "Problem with the API key. It may have expired.",
  RATE_LIMIT: "Too many requests. Wait a minute and try again.",
  NETWORK: "No connection, or the server is not responding.",
  SERVER: "Riot server error. Try again later.",
};

// Ошибки, при которых повтор с тем же запросом ничего не изменит
const NO_RETRY = new Set(["NOT_FOUND", "BAD_REQUEST"]);

export function getErrorText(error) {
  return MESSAGES[error?.kind] ?? "Something went wrong.";
}

export function canRetry(error) {
  return !NO_RETRY.has(error?.kind);
}
