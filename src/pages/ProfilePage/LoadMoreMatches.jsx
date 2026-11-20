import { WakeUpNotice } from "../../components";
import { getErrorText } from "../../components/ErrorMessage/errorText.js";
import { MATCHES_PAGE_SIZE } from "../../service";

// Кнопка под историей матчей: подгружает следующие игры (по MATCHES_PAGE_SIZE).
// remaining — сколько ещё матчей можно подгрузить, since — когда началась
// текущая подгрузка (null — не идёт). Ошибку показываем под кнопкой,
// повтор — та же кнопка
export function LoadMoreMatches({ remaining, since, error, disabled, onLoad }) {
  if (remaining <= 0) return null;

  const count = Math.min(MATCHES_PAGE_SIZE, remaining);
  const loading = Boolean(since);

  return (
    <div className="loadMoreMatches">
      <div className="loadMoreRow">
        <button
          className="searchbtn loadMoreBtn"
          onClick={onLoad}
          disabled={loading || disabled}
        >
          {loading
            ? "Loading..."
            : `Show ${count} more ${count === 1 ? "game" : "games"}`}
        </button>
        <WakeUpNotice since={since} compact />
      </div>
      {error && !loading && (
        <p className="loadMoreError" role="alert">
          {getErrorText(error)}
        </p>
      )}
    </div>
  );
}
