import { riotApi, regionToCluster } from "../../riotApi";
export async function loadPlayer(playerData) {
  // 1. Парсим данные из URL (например: MishaCrazy-RU1-RU)
  const parts = decodeURIComponent(playerData).split("-");
  const regionKey = parts.pop(); // RU
  const tagLine = parts.pop(); // RU1
  const gameName = parts.join("-").replace(/_/g, " "); // MishaCrazy

  const { cluster, region: regionUrl } = regionToCluster[regionKey];

  const version = await riotApi.getVersion();

  // 2. Получаем PUUID и версию игры
  const account = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster);

  // 3. Загружаем всё остальное параллельно
  const [sumData, rank, matchIds, masteries, champions, itemsResponse] =
    await Promise.all([
      riotApi.getSummonerLevel(account.puuid, regionUrl),
      riotApi.getRank(account.puuid, regionUrl),
      riotApi.getRecentMatch(account.puuid, cluster),
      riotApi.getChampMasteries(account.puuid, regionUrl),
      riotApi.getChampions(version),
      riotApi.getItemsInfo(version),
    ]);

  // 4. Детальная инфа о последних 5 матчах
  const matchDetails = await Promise.all(
    matchIds.slice(0, 5).map((id) => riotApi.getMatchInfo(id, cluster)),
  );
  return {
    account,
    sumData,
    rank,
    masteries,
    champions,
    version,
    matches: matchDetails,
    items: itemsResponse.data,
  };
}
