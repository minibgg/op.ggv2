import { version } from "react";

const API_KEY = import.meta.env.VITE_RIOT_KEY;
const CDRAGON_API =
  "/api/latest/plugins/rcp-be-lol-game-data/global/default/v1";

export const regionToCluster = {
  EUW: {
    cluster: "europe.api.riotgames.com",
    region: "euw1.api.riotgames.com",
  },
  EUNE: {
    cluster: "europe.api.riotgames.com",
    region: "eun1.api.riotgames.com",
  },
  RU: { cluster: "europe.api.riotgames.com", region: "ru.api.riotgames.com" },
  NA: {
    cluster: "americas.api.riotgames.com",
    region: "na1.api.riotgames.com",
  },
  BR: {
    cluster: "americas.api.riotgames.com",
    region: "br1.api.riotgames.com",
  },
  KR: { cluster: "asia.api.riotgames.com", region: "kr.api.riotgames.com" },
  TR: { cluster: "europe.api.riotgames.com", region: "tr1.api.riotgames.com" },
};

export const riotApi = {
  async getPuuidByNameTag(gameName, tagLine, cluster) {
    let cleanName = decodeURIComponent(gameName);
    let cleanTag = decodeURIComponent(tagLine);

    cleanName = cleanName
      .replace(
        /[\u200B-\u200D\uFEFF\u200E\u200F\u2026\u2029\u202A-\u202E\u2066-\u2069]/g,
        "",
      )
      .trim();
    cleanTag = cleanTag
      .replace(
        /[\u200B-\u200D\uFEFF\u200E\u200F\u2026\u2029\u202A-\u202E\u2066-\u2069]/g,
        "",
      )
      .trim();

    const res = await fetch(
      `https://${cluster}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanName)}/${encodeURIComponent(cleanTag)}?api_key=${API_KEY}`,
    );

    if (!res.ok) {
      throw new Error(`Riot Account не найден (Статус: ${res.status})`);
    }

    const data = await res.json();
    return data;
  },
  async getSummonerLevel(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (summoner): ${res.status}`);
    const data = await res.json();
    return data;
  },
  async getRecentMatch(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (match ids): ${res.status}`);
    const data = await res.json();
    return data;
  },
  async getMatchInfo(matchId, region) {
    const res = await fetch(
      `https://${region}/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (match info): ${res.status}`);
    const data = await res.json();
    return data;
  },
  async getVersion() {
    const res = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
    );
    const data = await res.json();
    return data[0];
  },
  async getRank(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (rank): ${res.status}`);
    const data = await res.json();
    return data;
  },
  async getChampMasteries(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`Riot API ошибка (masteries): ${res.status}`);
    const data = await res.json();
    return data;
  },
  async getChampMasteries(puuid, region) {
    const res = await fetch(
      `https://${region}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${API_KEY}`,
    );
    const data = await res.json();
    return data;
  },
  async getChampions(version) {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    );
    const data = await res.json();
    return data.data;
  },
  async getSumms(version) {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
    );
    const data = await res.json();
    return data;
  },
  async getHeroRune() {
    const res = await fetch(
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-rune-recommendations.json`,
    );
    const data = await res.json();
    return data;
  },
  async getHeroItems(championId) {
    const res = await fetch(`${CDRAGON_API}/champions/${championId}.json`);
    const data = await res.json();
    return data;
  },
  async getItemsInfo(version) {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
    );
    const data = await res.json();
    return data;
  },
};
