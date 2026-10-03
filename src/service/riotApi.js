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

// Вспомогательная функция с таймаутом в 8 секунд
async function fetchWithTimeout(url, options = {}) {
  return await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(8000), // Не дает серверу зависнуть надолго
  });
}

export const riotApi = {
  ...dataDragonApi,

  async getPuuidByNameTag(gameName, tagLine, cluster) {
    let cleanName = decodeURIComponent(gameName)
      .replace(
        /[\u200B-\u200D\uFEFF\u200E\u200F\u2026\u2029\u202A-\u202E\u2066-\u2069]/g,
        "",
      )
      .trim();

    let cleanTag = decodeURIComponent(tagLine)
      .replace(
        /[\u200B-\u200D\uFEFF\u200E\u200F\u2026\u2029\u202A-\u202E\u2066-\u2069]/g,
        "",
      )
      .trim();

    // Очистка от мусорных символов в конце (например ":1")
    cleanTag = cleanTag.split(":")[0];

    const res = await fetchWithTimeout(
      `https://${cluster}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanName)}/${encodeURIComponent(cleanTag)}?api_key=${API_KEY}`,
    );

    if (!res.ok) {
      const err = new Error(`Riot Account не найден (Статус: ${res.status})`);
      err.status = res.status;
      throw err;
    }

    return await res.json();
  },

  async getSummonerLevel(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (summoner): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },

  // ИСПРАВЛЕНО: Для матчей нужен cluster, а не region
  async getRecentMatch(puuid, cluster) {
    const res = await fetchWithTimeout(
      `https://${cluster}/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`,
    );
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (match ids): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },

  // ИСПРАВЛЕНО: Для матчей нужен cluster, а не region
  async getMatchInfo(matchId, cluster) {
    const res = await fetchWithTimeout(
      `https://${cluster}/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`,
    );
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (match info): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },

  async getRank(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (rank): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },

  async getChampMasteries(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${API_KEY}`,
    );
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (masteries): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },

  async getLiveGame(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/spectator/v5/active-games/by-summoner/${puuid}?api_key=${API_KEY}`,
    );
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      const err = new Error(`Riot API ошибка (live game): ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  },
};
