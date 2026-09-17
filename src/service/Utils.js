export * from "./riotApi.js";
export * from "./riotService.js";

export function getWinStreak(matches, puuid) {
  let streak = 0;
  if (!matches) return 0;
  for (const match of matches) {
    const player = match.info?.participants?.find(
      (player) => player.puuid === puuid,
    );
    if (!player) break;
    if (player.win) streak++;
    else break;
  }
  return streak;
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

export const RankColor = {
  IRON: "#828388",
  BRONZE: "#a97148",
  SILVER: "#b4c1c9",
  GOLD: "#f1a80a",
  PLATINUM: "#38b6ab",
  EMERALD: "#10b981",
  DIAMOND: "#4aa8f8",
  MASTER: "#c054f7",
  GRANDMASTER: "#ef4444",
  CHALLENGER: "#f4c874",
  UNRANKED: "#8d929b",
};

export function getRankColor(tier) {
  if (!tier || typeof tier !== "string") return RankColor.UNRANKED;
  return RankColor[tier.trim().toUpperCase()] || RankColor.UNRANKED;
}

const RECENT_SEARCHES_KEY = "lol_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch({
  name,
  region,
  playerData,
  profileIconId,
  version,
}) {
  try {
    const list = getRecentSearches();
    const filtered = list.filter((item) => item.playerData !== playerData);
    const existing = list.find((item) => item.playerData === playerData);

    const newItem = {
      name,
      region,
      playerData,
      profileIconId: profileIconId ?? existing?.profileIconId ?? null,
      version: version ?? existing?.version ?? null,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentSearch(playerData) {
  try {
    const list = getRecentSearches();
    const updated = list.filter((item) => item.playerData !== playerData);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    return [];
  } catch {
    return [];
  }
}
