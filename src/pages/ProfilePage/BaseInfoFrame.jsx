import { SummonerIcon } from "./SummonerIcon.jsx";
import { getRankColor, getWinStreak } from "../../service";

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

export function BaseInfoFrame({ data, soloQ, rankedflex, rankedPremade }) {
  const soloQColor =
    soloQ?.tier && soloQ.tier.toUpperCase() !== "UNRANKED"
      ? getRankColor(soloQ.tier)
      : null;

  const frameStyle = soloQColor
    ? {
        "--rank-border": soloQColor,
        "--rank-bg": `${soloQColor}1f`,
        "--rank-shadow": `${soloQColor}40`,
        "--rank-shadow-soft": `${soloQColor}20`,
      }
    : undefined;

  return (
    <div className="baseInfoFrame" style={frameStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {data.sumData?.profileIconId && (
          <SummonerIcon
            iconId={data.sumData.profileIconId}
            size={50}
            version={data.version}
            className="baseInfoIcon"
          />
        )}
        <h2 style={{ margin: 0 }}>
          {data.account?.gameName}#{data.account?.tagLine}
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
