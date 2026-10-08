import { dataDragonApi } from "./dataDragon.js";

export { dataDragonApi };

// Запросы к Riot идут через наш бэкенд: ключ хранится только на сервере
const API_URL = import.meta.env.VITE_API_URL;

// Регионы, которые поддерживает бэкенд
export const REGIONS = ["EUW", "EUNE", "RU", "NA", "BR", "KR", "TR"];

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

// Единая точка запросов к бэкенду: таймаут, отмена и проверка статуса.
// Таймаут 60 секунд: бесплатный Render просыпается после простоя до минуты
async function riotFetch(path, { signal, timeout = 60000 } = {}) {
  const url = `${API_URL}/api/riot${path}`;

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

  if (!res.ok) {
    // Бэкенд присылает { error: { kind } }; если тела нет — определяем по статусу
    const body = await res.json().catch(() => null);
    const kind = body?.error?.kind;
    throw kind ? createRiotError(res.status, kind) : toRiotError(res.status);
  }
  return res.json();
}

export const riotApi = {
  ...dataDragonApi,

  getPuuidByNameTag(gameName, tagLine, regionKey, options) {
    return riotFetch(
      `/account/${regionKey}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      options,
    );
  },

  getSummonerLevel(puuid, regionKey, options) {
    return riotFetch(`/summoner/${regionKey}/${puuid}`, options);
  },

  getRecentMatch(puuid, regionKey, options) {
    return riotFetch(`/matches/${regionKey}/${puuid}`, options);
  },

  getMatchInfo(matchId, regionKey, options) {
    return riotFetch(`/match/${regionKey}/${matchId}`, options);
  },

  getRank(puuid, regionKey, options) {
    return riotFetch(`/rank/${regionKey}/${puuid}`, options);
  },

  getChampMasteries(puuid, regionKey, options) {
    return riotFetch(`/masteries/${regionKey}/${puuid}`, options);
  },

  // Если игрок не в матче, бэкенд возвращает null
  getLiveGame(puuid, regionKey, options) {
    return riotFetch(`/live/${regionKey}/${puuid}`, options);
  },
};
