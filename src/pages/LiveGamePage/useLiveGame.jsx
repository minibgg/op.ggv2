import { useCallback, useEffect, useRef, useState } from "react";
import {
  getChampionNamesMap,
  getLiveGame,
  getPlayerRank,
  getRankColor,
} from "../../service";
import { getChampionPositions } from "./liveGameUtils.js";

// Статика для доски. Ошибки внутри уже превращены в пустые словари,
// так что доска отрисуется и без неё (просто без имён чемпионов).
// Справочник рун RunesCell грузит сам
async function loadStatics() {
  const [positions, championNames] = await Promise.all([
    getChampionPositions(),
    getChampionNamesMap(),
  ]);
  return { positions, championNames };
}

// Цвет ранга SoloQ или null, если игрок без ранга
function getSoloQColor(rank) {
  const soloQ = rank?.find((q) => q.queueType === "RANKED_SOLO_5x5");
  const isRanked = soloQ?.tier && soloQ.tier.toUpperCase() !== "UNRANKED";
  return isRanked ? getRankColor(soloQ.tier) : null;
}

export function useLiveGame(playerData) {
  // { account, game, positions, championNames, updatedAt }; game === null — не в игре
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(playerData));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rankColor, setRankColor] = useState(null);
  // Шаг загрузки для панели статуса: 0 — аккаунт, 1 — проверка активной игры
  const [step, setStep] = useState(0);
  // Когда начался текущий запрос — для уведомления о просыпающемся сервере
  const [startedAt, setStartedAt] = useState(null);
  // Номер последнего запроса: ответы на устаревшие запросы игнорируем
  const requestId = useRef(0);

  const fetchLiveGame = useCallback(
    async (isRefresh = false) => {
      if (!playerData) return;

      const id = ++requestId.current;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setStep(0);
      }
      setStartedAt(Date.now());
      setError(null);

      const onProgress = (update) => {
        if (id === requestId.current) setStep(update.step);
      };

      try {
        const [live, statics] = await Promise.all([
          getLiveGame(playerData, onProgress),
          loadStatics(),
        ]);
        if (id === requestId.current) {
          setData({ ...live, ...statics, updatedAt: Date.now() });
        }
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
    fetchLiveGame(false);
  }, [fetchLiveGame]);

  // Цвет темы: ранг берётся из кеша профиля, иначе одним фоновым запросом
  const puuid = data?.account?.puuid;
  useEffect(() => {
    if (!puuid) return;
    let cancelled = false;
    getPlayerRank(playerData, puuid)
      .then((rank) => {
        if (!cancelled) setRankColor(getSoloQColor(rank));
      })
      .catch((err) => console.warn("Не удалось получить ранг для темы:", err));
    return () => {
      cancelled = true;
    };
  }, [playerData, puuid]);

  return {
    data,
    loading,
    refreshing,
    error,
    step,
    startedAt,
    rankColor,
    refresh: () => fetchLiveGame(true),
    retry: () => fetchLiveGame(false),
  };
}
