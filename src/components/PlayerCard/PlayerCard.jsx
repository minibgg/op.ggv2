import { Link } from "react-router-dom";
import PlayerItems from "../HoveredItem/ItemDescription.jsx";
import { ChampionIcon, SummonerSpellIcon } from "../../service";
import "./PlayerCard.css";

export default function PlayerCard({ p, version, currentRegion, items }) {
  const name = p.riotIdGameName;
  const tag = p.riotIdTagline;

  const formattedName = `${name}-${tag}`.replace(/\s/g, "_");
  const profilePath = `/profile/${encodeURIComponent(formattedName)}-${currentRegion}`;

  const spell1 = p.summoner1Id ?? p.spell1Id;
  const spell2 = p.summoner2Id ?? p.spell2Id;

  return (
    <Link
      to={profilePath}
      className="playerMatchCard"
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <div className="playerCardHeroBlock">
        <ChampionIcon
          championId={p.championId}
          size={48}
          className="playerCardChampion"
        />
        {(spell1 || spell2) && (
          <div className="playerCardSpells">
            {spell1 && (
              <SummonerSpellIcon
                spellId={spell1}
                size={23}
                version={version}
                className="playerCardSpellIcon"
              />
            )}
            {spell2 && (
              <SummonerSpellIcon
                spellId={spell2}
                size={23}
                version={version}
                className="playerCardSpellIcon"
              />
            )}
          </div>
        )}
      </div>
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
