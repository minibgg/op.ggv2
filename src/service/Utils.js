export * from "./riotApi.js";
export * from "./riotService.js";

export function getWinStreak(matches, puuid) {
  let streak = 0;
  if (!matches) return 0;
  for (const match of matches) {
    const player = match.info?.participants?.find((p) => p.puuid === puuid);
    if (!player) break;
    if (player.win) streak++;
    else break;
  }
  return streak;
}

export function getGameModeLabel(queueId, gameMode) {
  switch (queueId) {
    // Ранговые игры
    case 420:
      return "Ranked Solo/Duo";
    case 440:
      return "Ranked Flex";

    // Обычные игры
    case 400:
      return "Normal Draft";
    case 430:
    case 490:
      return "Normal Blind";
    case 480:
      return "Quickplay"; // Быстрая игра

    // Постоянные режимы
    case 450:
      return "ARAM";
    case 1700:
    case 1710:
      return "Arena";

    // Своя игра и тренировка
    case 0:
      return "Custom Game";

    default:
      // Фоллбек на gameMode, если queueId новый или неизвестный
      if (gameMode === "PRACTICETOOL") return "Practice Tool";
      if (gameMode === "TFT") return "TFT";
      if (gameMode === "STRAWBERRY") return "Swarm";
      if (gameMode === "URF" || gameMode === "ARURF") return "URF";

      return "Special Mode";
  }
}
