import { useState, useEffect } from "react";
import { loadPlayer } from "../../service";

export function usePlayerData(playerData, playerName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerData) return;

    async function fetchPlayerData() {
      try {
        setLoading(true);
        setError(null);
        const result = await loadPlayer(playerData, playerName);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerData();
  }, [playerData, playerName]);

  return { data, loading, error };
}
