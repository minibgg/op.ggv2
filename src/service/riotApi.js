const API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_RIOT_KEY) ||
  (typeof process !== "undefined" && process.env?.RIOT_KEY);

const CDRAGON_API =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";

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
      throw new Error(`Riot Account не найден (Статус: ${res.status})`);
    }

    return await res.json();
  },

  async getSummonerLevel(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (summoner): ${res.status}`);
    return await res.json();
  },

  // ИСПРАВЛЕНО: Для матчей нужен cluster, а не region
  async getRecentMatch(puuid, cluster) {
    const res = await fetchWithTimeout(
      `https://${cluster}/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (match ids): ${res.status}`);
    return await res.json();
  },
  // ИСПРАВЛЕНО: Для матчей нужен cluster, а не region
  async getMatchInfo(matchId, cluster) {
    const res = await fetchWithTimeout(
      `https://${cluster}/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (match info): ${res.status}`);
    return await res.json();
  },

  async getVersion() {
    const res = await fetchWithTimeout(
      "https://ddragon.leagueoflegends.com/api/versions.json",
    );
    const data = await res.json();
    return data[0];
  },

  async getRank(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (rank): ${res.status}`);
    return await res.json();
  },

  async getChampMasteries(puuid, region) {
    const res = await fetchWithTimeout(
      `https://${region}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (masteries): ${res.status}`);
    return await res.json();
  },

  async getChampions(version) {
    const res = await fetchWithTimeout(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    );
    const data = await res.json();
    return data.data;
  },

  async getSumms(version) {
    const res = await fetchWithTimeout(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
    );
    return await res.json();
  },

  async getHeroRune() {
    const res = await fetchWithTimeout(
      `${CDRAGON_API}/champion-rune-recommendations.json`,
    );
    return await res.json();
  },

  async getHeroItems(championId) {
    const res = await fetchWithTimeout(
      `${CDRAGON_API}/champions/${championId}.json`,
    );
    return await res.json();
  },

  async getItemsInfo(version) {
    const res = await fetchWithTimeout(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
    );
    const data = await res.json();

    const items = data.data;
    for (const key in items) {
      if (items[key].description) {
        items[key].description = items[key].description
          .replace(/<mainText>/g, '<span class="item-mainText">')
          .replace(/<\/mainText>/g, "</span>")
          .replace(/<stats>/g, "<span>")
          .replace(/<\/stats>/g, "</span>")
          .replace(/<br\s*\/?>/g, "<br />")
          .replace(/<attention>/g, '<span class="item-attention">')
          .replace(/<\/attention>/g, "</span>")
          .replace(/<passive>/g, '<span class="item-passive">')
          .replace(/<\/passive>/g, "</span>")
          .replace(/<OnHit>/g, '<span class="item-onhit">')
          .replace(/<\/OnHit>/g, "</span>");
      }
    }

    return items;
  },
  async getLiveGame(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/spectator/v5/active-games/by-summoner/${puuid}?api_key=${API_KEY}`,
    );
    if (res.status === 404) {
      return null;
    }
    return await res.json();
  },
};
