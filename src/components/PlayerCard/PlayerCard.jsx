import { Link } from "react-router-dom";
import PlayerItems from "../HoveredItem/ItemDescription.jsx";
import { ChampionIcon, SummonerSpellIcon } from "../../service";
import "./PlayerCard.css";

export default function PlayerCard({
  player,
  p,
  version,
  currentRegion,
  items,
}) {
  const targetPlayer = player || p;
  const name = targetPlayer.riotIdGameName;
  const tag = targetPlayer.riotIdTagline;

  const formattedName = `${name}-${tag}`.replace(/\s/g, "_");
  const profilePath = `/profile/${encodeURIComponent(formattedName)}-${currentRegion}`;

  const spell1 = targetPlayer.summoner1Id ?? targetPlayer.spell1Id;
  const spell2 = targetPlayer.summoner2Id ?? targetPlayer.spell2Id;

  return (
    <Link
      to={profilePath}
      className="playerMatchCard"
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <div className="playerCardHeroBlock">
        <ChampionIcon
          championId={targetPlayer.championId}
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
        <p className="playerCardName">
          {targetPlayer.riotIdGameName || targetPlayer.summonerName}
        </p>
        <p className="playerCardScore">
          {targetPlayer.kills}/{targetPlayer.deaths}/{targetPlayer.assists}
        </p>
        <PlayerItems
          player={targetPlayer}
          p={targetPlayer}
          version={version}
          items={items}
        />
      </div>
      <div className="playerCardStat">
        <span className="playerCardStatLabel">DMG</span>
        <span className="playerCardStatValue" style={{ fontSize: "18px" }}>
          {targetPlayer.totalDamageDealtToChampions}
        </span>
        <span className="playerCardStatLabel" style={{ fontSize: "14px" }}>
          cs:{" "}
          {targetPlayer.totalMinionsKilled +
            (targetPlayer.totalAllyJungleMinionsKilled || 0) +
            (targetPlayer.totalEnemyJungleMinionsKilled || 0)}
        </span>
      </div>
    </Link>
  );
}
