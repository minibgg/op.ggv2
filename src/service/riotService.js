import { REGIONS, riotApi } from "./riotApi.js";

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export function clearPlayerCache(playerData) {
  if (playerData) {
    cache.delete(playerData);
  } else {
    cache.clear();
  }
}

export function parsePlayerData(playerData) {
  const parts = decodeURIComponent(playerData).split("-");
  const rawRegion = parts.pop() || "EUW"; // RU / EUW
  const tagLine = parts.pop() || ""; // RU1 / EUW
  const gameName = parts.join("-").replace(/_/g, " "); // MishaCrazy

  const regionKey = REGIONS.includes(rawRegion) ? rawRegion : "EUW";
  return { gameName, tagLine, regionKey };
}

export async function loadPlayer(playerData, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cache.get(playerData);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  } else {
    cache.delete(playerData);
  }

  const { gameName, tagLine, regionKey } = parsePlayerData(playerData);

  const [version, account] = await Promise.all([
    riotApi.getVersion(),
    riotApi.getPuuidByNameTag(gameName, tagLine, regionKey),
  ]);

  // Загружаем всю остальную информацию параллельно
  const [sumData, rank, matchIds, masteries, champions, itemsResponse] =
    await Promise.all([
      riotApi.getSummonerLevel(account.puuid, regionKey),
      riotApi.getRank(account.puuid, regionKey),
      riotApi.getRecentMatch(account.puuid, regionKey),
      riotApi.getChampMasteries(account.puuid, regionKey),
      riotApi.getChampions(version),
      riotApi.getItemsInfo(version),
    ]);

  // Детальная инфа о последних 5 матчах
  const matchDetails = await Promise.all(
    (matchIds || []).slice(0, 5).map((id) => riotApi.getMatchInfo(id, regionKey)),
  );

  const now = Date.now();
  const result = {
    account,
    sumData,
    rank,
    masteries,
    champions,
    version,
    matches: matchDetails,
    items: itemsResponse,
    lastUpdated: now,
  };

  cache.set(playerData, { data: result, timestamp: now });
  return result;
}

export async function getLiveGame(playerData) {
  const { gameName, tagLine, regionKey } = parsePlayerData(playerData);

  const account = await riotApi.getPuuidByNameTag(gameName, tagLine, regionKey);

  return await riotApi.getLiveGame(account.puuid, regionKey);
}

let summonerSpellsCache = null;

export async function getSummonerSpellsMap() {
  if (summonerSpellsCache) {
    return summonerSpellsCache;
  }

  try {
    const spells = await riotApi.getSummonerSpells();
    summonerSpellsCache = spells.reduce((acc, s) => {
      acc[s.id] = {
        id: s.id,
        name: s.name,
        iconUrl: s.iconPath
          ? s.iconPath
              .toLowerCase()
              .replace(
                "/lol-game-data/assets/",
                "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/",
              )
          : "",
      };
      return acc;
    }, {});
    return summonerSpellsCache;
  } catch (err) {
    console.error("Ошибка при загрузке заклинаний:", err);
    return {};
  }
}
