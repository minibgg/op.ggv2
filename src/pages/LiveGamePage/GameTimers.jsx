import { useEffect, useState } from "react";
import { formatElapsed } from "./liveGameUtils.js";

// Режим, время игры (тикает каждую секунду) и начало игры по часам зрителя.
// Пока идёт загрузочный экран, Riot отдаёт gameStartTime = 0
export function GameTimers({ gameStartTime, modeLabel }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!gameStartTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [gameStartTime]);

  if (!gameStartTime) {
    return (
      <div className="liveTimers">
        <span className="liveTimerLabel">{modeLabel}</span>
        <span className="liveTimerLoading">Loading screen</span>
      </div>
    );
  }

  const startedAt = new Date(gameStartTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="liveTimers">
      <span className="liveTimerLabel">{modeLabel}</span>
      <span className="liveTimer" title="Game time">
        {formatElapsed((now - gameStartTime) / 1000)}
      </span>
      <span className="liveTimerStart">Started at {startedAt}</span>
    </div>
  );
}
