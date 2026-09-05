import { useState, useEffect } from "react";
import { loadPlayer } from "./RiotService.js";

export * from "./RiotApi.js";
export * from "./RiotService.js";

export function getWinStreak(matches, puuid) {
  let streak = 0;
  if (!matches) return 0;
  for (const match of matches) {
    const player = match.info?.participants?.find((p) => p.puuid === puuid);
    if (!player) break;
    if (player.win) streak++;
    else break;
  }
  return streak;
}

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

export function getFormattedName(playerData) {
  const parts = playerData ? playerData.split("-") : [];
  const currentRegion = parts.length > 1 ? parts.pop() : "EUW";
  const playerName = parts.length > 0 ? parts.join("-") : playerData || "";

  const formattedPlayerName = playerName
    .replaceAll("_", " ")
    .replaceAll("-", "#");

  return {
    currentRegion,
    playerName,
    formattedPlayerName,
  };
}

export function getGameModeLabel(queueId, gameMode) {
  switch (queueId) {
    // Ранговые игры
    case 420:
      return "Ranked Solo/Duo";
    case 440:
      return "Ranked Flex";

    // Обычные игры
    case 400:
      return "Normal Draft";
    case 430:
    case 490:
      return "Normal Blind";
    case 480:
      return "Quickplay"; // Быстрая игра

    // Постоянные режимы
    case 450:
      return "ARAM";
    case 1700:
    case 1710:
      return "Arena";

    // Своя игра и тренировка
    case 0:
      return "Custom Game";

    default:
      // Фоллбек на gameMode, если queueId новый или неизвестный
      if (gameMode === "PRACTICETOOL") return "Practice Tool";
      if (gameMode === "TFT") return "TFT";
      if (gameMode === "STRAWBERRY") return "Swarm";
      if (gameMode === "URF" || gameMode === "ARURF") return "URF";

      return "Special Mode";
  }
}
