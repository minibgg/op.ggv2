import "./LoadStatus.css";
import { useEffect, useState } from "react";
import { canRetry, getErrorText } from "../ErrorMessage/errorText.js";

// Через сколько показывать уведомление: обычная загрузка укладывается быстрее
const WAKE_UP_DELAY = 4000;

function formatClock(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Уведомление о просыпающемся бесплатном сервере (Render засыпает после простоя).
// since — когда началось ожидание; появляется, если оно длится дольше 4 секунд,
// и показывает, сколько уже прошло. compact — короткая версия для кнопки Refresh
export function WakeUpNotice({ since, compact = false }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!since) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since]);

  if (!since) return null;
  const elapsed = Math.max(0, now - since);
  if (elapsed < WAKE_UP_DELAY) return null;

  const timer = <span className="wakeUpTimer">{formatClock(elapsed)}</span>;

  if (compact) {
    return (
      <span className="wakeUpNotice compact" role="status">
        Server is waking up… {timer}
      </span>
    );
  }

  return (
    <p className="wakeUpNotice" role="status">
      The server is waking up after being idle — the first load can take up to a
      minute. {timer}
    </p>
  );
}

const STEP_ICONS = { done: "✓", failed: "✕", pending: "·" };

// Панель статуса загрузки страницы (не путать с Loading screen — стадией игры).
// steps — подписи шагов, current — индекс идущего шага (до него всё готово).
// Пока идёт первый шаг, wakeUpSince включает уведомление о просыпающемся сервере.
// error — загрузка упала на шаге current: крестик, текст ошибки, кнопка Retry
// (кроме «игрок не найден») и кнопка назад back = { label, onClick }
export function LoadStatus({
  title,
  subtitle,
  steps,
  current,
  error,
  wakeUpSince,
  onRetry,
  back,
}) {
  return (
    <section className={`loadStatus${error ? " failed" : ""}`} aria-live="polite">
      <div className="loadStatusHead">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <ol className="loadSteps">
        {steps.map((label, i) => {
          const state =
            i < current
              ? "done"
              : i === current
                ? error
                  ? "failed"
                  : "active"
                : "pending";
          return (
            <li key={i} className={`loadStep ${state}`}>
              <span className="loadStepIcon" aria-hidden="true">
                {state === "active" ? (
                  <span className="loadSpinner" />
                ) : (
                  STEP_ICONS[state]
                )}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      {error ? (
        <div className="loadStatusError" role="alert">
          <p>{getErrorText(error)}</p>
          <div className="loadStatusActions">
            {canRetry(error) && onRetry && (
              <button className="searchbtn" onClick={onRetry}>
                Retry
              </button>
            )}
            {back && (
              <button className="searchbtn" onClick={back.onClick}>
                {back.label}
              </button>
            )}
          </div>
        </div>
      ) : (
        <WakeUpNotice since={wakeUpSince} />
      )}
    </section>
  );
}
