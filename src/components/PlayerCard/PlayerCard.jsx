import { Link } from "react-router-dom";
import PlayerItems from "../HoveredItem/ItemDescription.jsx";
import { ChampionIcon } from "../../service";
import "./PlayerCard.css";

export default function PlayerCard({ p, version, currentRegion, items }) {
  const name = p.riotIdGameName;
  const tag = p.riotIdTagline;

  const formattedName = `${name}-${tag}`.replace(/\s/g, "_");
  const profilePath = `/profile/${encodeURIComponent(formattedName)}-${currentRegion}`;

  return (
    <Link
      to={profilePath}
      className="playerMatchCard"
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <ChampionIcon
        className="playerCardChampion"
        championName={p.championName}
        championId={p.championId}
        version={version}
        width={48}
        height={48}
        alt={p.championName}
      />
      <div className="playerCardMain">
        <p className="playerCardName">{p.riotIdGameName || p.summonerName}</p>
        <p className="playerCardScore">
          {p.kills}/{p.deaths}/{p.assists}
        </p>
        <PlayerItems p={p} version={version} items={items} />
      </div>
      <div className="playerCardStat">
        <span className="playerCardStatLabel">DMG</span>
        <span className="playerCardStatValue" style={{ fontSize: "18px" }}>
          {p.totalDamageDealtToChampions}
        </span>
        <span className="playerCardStatLabel" style={{ fontSize: "14px" }}>
          cs:{" "}
          {p.totalMinionsKilled +
            (p.totalAllyJungleMinionsKilled || 0) +
            (p.totalEnemyJungleMinionsKilled || 0)}
        </span>
      </div>
    </Link>
  );
}
