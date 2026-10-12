import { useCallback, useEffect, useRef, useState } from "react";
import { loadPlayer } from "../../service";

const INITIAL_PROGRESS = { step: 0, matchesLoaded: 0, matchesTotal: 0 };

export function usePlayerData(playerData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  // Шаг загрузки для панели статуса: 0 — аккаунт, 1 — ранг и матчи, 2 — детали матчей
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  // Когда начался текущий запрос — для уведомления о просыпающемся сервере
  const [startedAt, setStartedAt] = useState(null);
  // Номер последнего запроса: ответы и прогресс устаревших запросов игнорируем
  const requestId = useRef(0);

  const fetchPlayerData = useCallback(
    async (isRefresh = false) => {
      if (!playerData) return;

      const id = ++requestId.current;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setProgress(INITIAL_PROGRESS);
      }
      setStartedAt(Date.now());
      setError(null);

      const onProgress = (update) => {
        if (id === requestId.current) {
          setProgress((prev) => ({ ...prev, ...update }));
        }
      };

      try {
        const result = await loadPlayer(playerData, isRefresh, onProgress);
        if (id !== requestId.current) return;
        setData(null);
        setData(result);
      } catch (err) {
        if (id === requestId.current) setError(err);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setStartedAt(null);
        }
      }
    },
    [playerData],
  );

  useEffect(() => {
    fetchPlayerData(false);
  }, [fetchPlayerData]);

  const refresh = useCallback(() => {
    return fetchPlayerData(true);
  }, [fetchPlayerData]);

  const retry = useCallback(() => {
    return fetchPlayerData(false);
  }, [fetchPlayerData]);

  return {
    data,
    loading,
    refreshing,
    error,
    progress,
    startedAt,
    refresh,
    retry,
  };
}
