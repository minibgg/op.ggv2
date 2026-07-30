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
export function formatItemDescription(description) {
  return description
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
