import { useCallback, useEffect, useState } from "react";
import { loadPlayer } from "../../service";

export function usePlayerData(playerData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayerData = useCallback(
    async (isRefresh = false) => {
      if (!playerData) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await loadPlayer(playerData, isRefresh);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
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

  return { data, loading, refreshing, error, refresh };
}
