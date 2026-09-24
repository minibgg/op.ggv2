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
  PLATINUM: "#3fa5bf",
  EMERALD: "#10b981",
  DIAMOND: "#4aa8f8",
  MASTER: "#c054f7",
  GRANDMASTER: "#ff4d4d",
  CHALLENGER: "#f4c874",
  UNRANKED: "#8d929b",
};

export function getRankColor(tier) {
  if (!tier || typeof tier !== "string") return RankColor.UNRANKED;
  return RankColor[tier.trim().toUpperCase()] || RankColor.UNRANKED;
}

const RECENT_SEARCHES_KEY = "lol_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  } catch {
    return [];
  }
}

export function isAccountPinned(playerData) {
  return getRecentSearches().some(
    (item) => item.playerData === playerData && item.pinned,
  );
}

export function togglePinRecentSearch(playerData, extraData = {}) {
  try {
    const list = getRecentSearches();
    const existing = list.find((item) => item.playerData === playerData);
    let updated;
    let nextState = true;

    if (existing) {
      nextState = !existing.pinned;
      updated = list.map((item) =>
        item.playerData === playerData ? { ...item, pinned: nextState } : item,
      );
    } else {
      const newItem = {
        name: extraData.name || playerData,
        region: extraData.region || "EUW",
        playerData,
        profileIconId: extraData.profileIconId ?? null,
        version: extraData.version ?? null,
        pinned: true,
      };
      updated = [newItem, ...list];
    }

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return { list: getRecentSearches(), isPinned: nextState };
  } catch {
    return { list: [], isPinned: false };
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
    const existing = list.find((item) => item.playerData === playerData);
    const filtered = list.filter((item) => item.playerData !== playerData);

    const newItem = {
      name,
      region,
      playerData,
      profileIconId: profileIconId ?? existing?.profileIconId ?? null,
      version: version ?? existing?.version ?? null,
      pinned: existing?.pinned || false,
    };

    const pinned = filtered.filter((i) => i.pinned);
    const unpinned = filtered.filter((i) => !i.pinned);
    const updated = newItem.pinned
      ? [newItem, ...pinned, ...unpinned.slice(0, MAX_RECENT_SEARCHES)]
      : [...pinned, newItem, ...unpinned].slice(
          0,
          MAX_RECENT_SEARCHES + pinned.length,
        );

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
    const list = getRecentSearches();
    const pinnedOnly = list.filter((item) => item.pinned);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(pinnedOnly));
    return pinnedOnly;
  } catch {
    return [];
  }
}

export function getGameHoursAgo(timestamp) {
  if (!timestamp) return null;
  const time =
    typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
  if (isNaN(time)) return null;

  const diffMs = Date.now() - time;
  if (diffMs < 0) {
    return "меньше часа назад";
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diffMs >= oneDayMs) {
    return null; // если больше 1 дня то не писать
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) {
    return "меньше часа назад";
  }

  const mod10 = hours % 10;
  const mod100 = hours % 100;
  let word = "часов";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) {
      word = "час";
    } else if (mod10 >= 2 && mod10 <= 4) {
      word = "часа";
    }
  }

  return `${hours} ${word} назад`;
}
