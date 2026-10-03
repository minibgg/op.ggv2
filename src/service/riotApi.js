import { dataDragonApi } from "./dataDragon.js";

export { dataDragonApi };

const API_KEY =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_RIOT_KEY
    : "";

export const regionToCluster = {
  EUW: {
    cluster: "europe.api.riotgames.com",
    region: "euw1.api.riotgames.com",
  },
  EUNE: {
    cluster: "europe.api.riotgames.com",
    region: "eun1.api.riotgames.com",
  },
  RU: {
    cluster: "europe.api.riotgames.com",
    region: "ru.api.riotgames.com",
  },
  NA: {
    cluster: "americas.api.riotgames.com",
    region: "na1.api.riotgames.com",
  },
  BR: {
    cluster: "americas.api.riotgames.com",
    region: "br1.api.riotgames.com",
  },
  KR: {
    cluster: "asia.api.riotgames.com",
    region: "kr.api.riotgames.com",
  },
  TR: {
    cluster: "europe.api.riotgames.com",
    region: "tr1.api.riotgames.com",
  },
};

// Создаёт обычную ошибку и добавляет к ней status и kind,
// чтобы UI мог выбрать нужное сообщение по kind
// kind: "NOT_FOUND" | "BAD_KEY" | "RATE_LIMIT" | "SERVER" | "NETWORK"
function createRiotError(status, kind) {
  const error = new Error(`Riot API: ${status} (${kind})`);
  error.status = status;
  error.kind = kind;
  return error;
}

function toRiotError(status) {
  if (status === 404) return createRiotError(status, "NOT_FOUND");
  if (status === 401 || status === 403) return createRiotError(status, "BAD_KEY");
  if (status === 429) return createRiotError(status, "RATE_LIMIT");
  return createRiotError(status, "SERVER");
}

// Единая точка запросов к Riot: ключ, таймаут, отмена и проверка статуса
async function riotFetch(host, path, { signal, timeout = 8000 } = {}) {
  const separator = path.includes("?") ? "&" : "?";
  const url = `https://${host}${path}${separator}api_key=${API_KEY}`;

  // Таймаут не даёт запросу висеть вечно; внешний signal нужен для ручной отмены
  const signals = [AbortSignal.timeout(timeout)];
  if (signal) signals.push(signal);

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.any(signals) });
  } catch (err) {
    if (signal?.aborted) throw err; // отмена вручную — не ошибка для пользователя
    throw createRiotError(0, "NETWORK"); // таймаут или нет сети
  }

  if (!res.ok) throw toRiotError(res.status);
  return res.json();
}

const cleanRiotId = (value) =>
  decodeURIComponent(value)
    .replace(
      /[\u200B-\u200D\uFEFF\u200E\u200F\u2026\u2029\u202A-\u202E\u2066-\u2069]/g,
      "",
    )
    .trim();

export const riotApi = {
  ...dataDragonApi,

  getPuuidByNameTag(gameName, tagLine, cluster, options) {
    const cleanName = cleanRiotId(gameName);
    // Очистка от мусорных символов в конце (например ":1")
    const cleanTag = cleanRiotId(tagLine).split(":")[0];

    return riotFetch(
      cluster,
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanName)}/${encodeURIComponent(cleanTag)}`,
      options,
    );
  },

  getSummonerLevel(puuid, region, options) {
    return riotFetch(
      region,
      `/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      options,
    );
  },

  // Для матчей нужен cluster, а не region
  getRecentMatch(puuid, cluster, options) {
    return riotFetch(
      cluster,
      `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      options,
    );
  },

  getMatchInfo(matchId, cluster, options) {
    return riotFetch(cluster, `/lol/match/v5/matches/${matchId}`, options);
  },

  getRank(puuid, region, options) {
    return riotFetch(
      region,
      `/lol/league/v4/entries/by-puuid/${puuid}`,
      options,
    );
  },

  getChampMasteries(puuid, region, options) {
    return riotFetch(
      region,
      `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5`,
      options,
    );
  },

  async getLiveGame(puuid, region, options) {
    try {
      return await riotFetch(
        region,
        `/lol/spectator/v5/active-games/by-summoner/${puuid}`,
        options,
      );
    } catch (err) {
      // 404 здесь не ошибка: игрок просто не в матче
      if (err.kind === "NOT_FOUND") return null;
      throw err;
    }
  },
};
