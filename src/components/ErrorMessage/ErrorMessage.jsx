import { Link } from "react-router-dom";

const MESSAGES = {
  NOT_FOUND: "Игрок не найден. Проверь ник, тег и регион.",
  BAD_KEY: "Проблема с API-ключом. Возможно, он просрочен.",
  RATE_LIMIT: "Слишком много запросов. Подожди минуту и повтори.",
  NETWORK: "Нет соединения или сервер не отвечает.",
  SERVER: "Ошибка на стороне Riot. Попробуй позже.",
};

export function ErrorMessage({ error, onRetry }) {
  const text = MESSAGES[error.kind] ?? "Что-то пошло не так.";

  return (
    <div role="alert">
      <h2>{text}</h2>
      {error.kind !== "NOT_FOUND" && onRetry && (
        <button onClick={onRetry}>Повторить</button>
      )}
      <Link to="/">На главную</Link>
    </div>
  );
}
