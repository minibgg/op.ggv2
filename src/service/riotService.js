import { REGIONS, riotApi } from "./riotApi.js";

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

const CDRAGON_ASSETS =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/";

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

// "/lol-game-data/assets/..." из JSON CommunityDragon → абсолютный URL картинки
function toCDragonAssetUrl(iconPath) {
  return iconPath
    ? iconPath.toLowerCase().replace("/lol-game-data/assets/", CDRAGON_ASSETS)
    : "";
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
        iconUrl: toCDragonAssetUrl(s.iconPath),
      };
      return acc;
    }, {});
    return summonerSpellsCache;
  } catch (err) {
    console.error("Ошибка при загрузке заклинаний:", err);
    return {};
  }
}

function toStyleMap(list = []) {
  return list.reduce((acc, s) => {
    acc[s.id] = {
      name: s.name,
      iconUrl: toCDragonAssetUrl(s.iconPath),
      description: (s.tooltip || "").trim(),
    };
    return acc;
  }, {});
}

// Описание руны из CommunityDragon → чистый текст для подсказки:
// без цитат-лора, <br>/<li> становятся переносами строк, теги убираются.
// Если в полном описании остались незаполненные @плейсхолдеры@ — берём краткое
function toRuneDescription(perk) {
  const html = /@[\w.]+@/.test(perk.longDesc || "")
    ? perk.shortDesc
    : perk.longDesc || perk.shortDesc;

  return (html || "")
    .split(/<hr\s*\/?>/i)[0]
    .replace(/<i>\s*['"‘“][\s\S]*?<\/i>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toPerkMap(list = []) {
  return list.reduce((acc, p) => {
    acc[p.id] = {
      name: p.name,
      iconUrl: toCDragonAssetUrl(p.iconPath),
      description: toRuneDescription(p),
    };
    return acc;
  }, {});
}

let runesCache = null;

// Руны и ветки рун по id: { perks: { [id]: { name, iconUrl, description } }, styles: { ... } }
export async function getRunesMap() {
  if (runesCache) {
    return runesCache;
  }

  try {
    const [perks, perkStyles] = await Promise.all([
      riotApi.getPerks(),
      riotApi.getPerkStyles(),
    ]);
    runesCache = {
      perks: toPerkMap(perks),
      styles: toStyleMap(perkStyles?.styles),
    };
    return runesCache;
  } catch (err) {
    console.error("Ошибка при загрузке рун:", err);
    return { perks: {}, styles: {} };
  }
}
