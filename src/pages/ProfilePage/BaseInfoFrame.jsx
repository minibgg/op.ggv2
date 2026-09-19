import { SummonerIcon } from "./SummonerIcon.jsx";
import {
  getRankColor,
  getWinStreak,
  isAccountPinned,
  togglePinRecentSearch,
} from "../../service";
import { useEffect, useState } from "react";

function RankRow({ label, queue }) {
  const color = getRankColor(queue?.tier);

  return (
    <div>
      <strong>{label}: </strong>
      <span className="rankTierText" style={{ color }}>
        {queue
          ? `${queue.tier} ${queue.rank} (${queue.leaguePoints} LP)`
          : "Unranked"}
      </span>
    </div>
  );
}

export function BaseInfoFrame({
  data,
  soloQ,
  rankedflex,
  rankedPremade,
  playerData,
  currentRegion,
}) {
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(() => isAccountPinned(playerData));

  useEffect(() => {
    setPinned(isAccountPinned(playerData));
  }, [playerData]);

  const copy = () => {
    navigator.clipboard.writeText(
      `${data.account?.gameName}#${data.account?.tagLine}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTogglePin = () => {
    const result = togglePinRecentSearch(playerData, {
      name: `${data.account?.gameName}#${data.account?.tagLine}`,
      region: currentRegion,
      profileIconId: data.sumData?.profileIconId,
      version: data.version,
    });
    setPinned(result.isPinned);
  };

  const soloQTier = soloQ?.tier ? soloQ.tier.toUpperCase().trim() : "";
  const isRanked = soloQTier && soloQTier !== "UNRANKED";
  const soloQColor = isRanked ? getRankColor(soloQTier) : null;
  const tierClass = isRanked ? `rank-${soloQTier.toLowerCase()}` : "";

  const frameStyle = soloQColor
    ? {
        "--rank-border": soloQColor,
        "--rank-bg": `${soloQColor}1f`,
        "--rank-shadow": `${soloQColor}40`,
        "--rank-shadow-soft": `${soloQColor}20`,
      }
    : undefined;

  return (
    <div className={`baseInfoFrame ${tierClass}`.trim()} style={frameStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {data.sumData?.profileIconId && (
          <SummonerIcon
            iconId={data.sumData.profileIconId}
            size={50}
            version={data.version}
            className="baseInfoIcon"
          />
        )}
        <h2 style={{ margin: 0, display: "flex", alignItems: "center" }}>
          <span>
            {data.account?.gameName}#{data.account?.tagLine}
          </span>
          <button
            className={`copyBtn ${copied ? "copied" : ""}`}
            onClick={copy}
            title={copied ? "Скопировано!" : "Скопировать никнейм"}
          >
            {copied ? "✓" : "⧉"}
          </button>
          <button
            className={`copyBtn pinBtn ${pinned ? "pinned" : ""}`}
            onClick={handleTogglePin}
            title={
              pinned
                ? "Открепить аккаунт"
                : "Закрепить аккаунт в недавнем поиске"
            }
          >
            📌
          </button>
        </h2>
      </div>

      <div>
        <strong>Уровень: </strong>
        {data.sumData?.summonerLevel}
      </div>

      <RankRow label="SoloQ rank" queue={soloQ} />
      <RankRow label="Flex rank" queue={rankedflex} />
      <RankRow label="5x5 rank" queue={rankedPremade} />

      {soloQ?.hotStreak && (
        <p className="warningStreak">
          WARNING win streak: {getWinStreak(data.matches, data.account?.puuid)}
        </p>
      )}

      {soloQ && (
        <div>
          <strong>SoloQ WR: </strong>
          {((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100).toFixed(1)}% (
          {soloQ.wins}W / {soloQ.losses}L)
        </div>
      )}
    </div>
  );
}
