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
};
