import { version } from "react";

export const dotaApi = {
  async getAccountInfo(account_id) {
    const res = await fetch(
      `https://api.opendota.com/api/players/${account_id}`,
    );
    const data = await res.json();
    return data;
  },
  async getWinLose(account_id) {
    const res = await fetch(
      `https://api.opendota.com/api/players/${account_id}/wl`,
    );
    const data = await res.json();
    return data;
  },
  async getRecentMatches(account_id) {
    const res = await fetch(
      `https://api.opendota.com/api/players/${account_id}/recentMatches`,
    );
    const data = await res.json();
    return data;
  },
  async getMatchInfo(match_id) {
    const res = await fetch(`https://api.opendota.com/api/matches/${match_id}`);
    const data = await res.json();
    return data;
  },
  async getHeroes() {
    const res = await fetch(`https://api.opendota.com/api/heroes`);
    const heroesName = await res.json();
    return heroesName;
  },
  async getItems() {
    const res = await fetch(`https://api.opendota.com/api/constants/items`);
    const items = res.json();
    return items;
  },
};
