const CDRAGON_API =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";

// Двухуровневый кеш: RAM (0ms) + Cache API браузера (между перезагрузками)
const staticMemoryCache = new Map();
let cachedVersion = null;
let versionTimestamp = 0;
const VERSION_CACHE_KEY = "lol_latest_version";
const VERSION_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 часов

// Вспомогательная функция с таймаутом в 8 секунд
async function fetchWithTimeout(url, options = {}) {
  return await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000), // Не дает зависнуть надолго
  });
}

// Загрузка JSON со статическим кешированием в Cache API браузера
async function fetchCachedJson(url, cacheName = "lol-static-cache") {
  if (staticMemoryCache.has(url)) {
    return staticMemoryCache.get(url);
  }

  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        staticMemoryCache.set(url, data);
        return data;
      }

      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        throw new Error(`Ошибка загрузки ${url}: ${res.status}`);
      }

      await cache.put(url, res.clone());
      const data = await res.json();
      staticMemoryCache.set(url, data);
      return data;
    } catch (err) {
      console.warn(
        "Cache API недоступен или вернул ошибку, fallback на прямой fetch:",
        err,
      );
    }
  }

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки ${url}: ${res.status}`);
  }
  const data = await res.json();
  staticMemoryCache.set(url, data);
  return data;
}

export const dataDragonApi = {
  async getVersion() {
    const now = Date.now();
    if (cachedVersion && now - versionTimestamp < VERSION_CACHE_TTL) {
      return cachedVersion;
    }

    try {
      const saved = localStorage.getItem(VERSION_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version && now - parsed.timestamp < VERSION_CACHE_TTL) {
          cachedVersion = parsed.version;
          versionTimestamp = parsed.timestamp;
          return cachedVersion;
        }
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }

    try {
      const res = await fetchWithTimeout(
        "https://ddragon.leagueoflegends.com/api/versions.json",
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const latest = data[0];

      cachedVersion = latest;
      versionTimestamp = now;
      try {
        localStorage.setItem(
          VERSION_CACHE_KEY,
          JSON.stringify({ version: latest, timestamp: now }),
        );
      } catch {
        // ignore
      }
      return latest;
    } catch (err) {
      if (cachedVersion) return cachedVersion;
      throw err;
    }
  },

  async getChampions(version) {
    const data = await fetchCachedJson(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
      `lol-static-${version}`,
    );
    return data.data;
  },

  async getSumms(version) {
    return await fetchCachedJson(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
      `lol-static-${version}`,
    );
  },

  async getSummonerSpells() {
    return await fetchCachedJson(
      `${CDRAGON_API}/summoner-spells.json`,
      "lol-static-cdragon",
    );
  },

  async getHeroRune() {
    return await fetchCachedJson(
      `${CDRAGON_API}/champion-rune-recommendations.json`,
      "lol-static-cdragon",
    );
  },

  async getHeroItems(championId) {
    return await fetchCachedJson(
      `${CDRAGON_API}/champions/${championId}.json`,
      "lol-static-cdragon",
    );
  },

  async getItemsInfo(version) {
    const memoryKey = `parsed_items_${version}`;
    if (staticMemoryCache.has(memoryKey)) {
      return staticMemoryCache.get(memoryKey);
    }

    const data = await fetchCachedJson(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
      `lol-static-${version}`,
    );

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

    staticMemoryCache.set(memoryKey, items);
    return items;
  },
};

export default dataDragonApi;
