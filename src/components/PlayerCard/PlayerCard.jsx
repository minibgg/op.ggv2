import { Link } from "react-router-dom";
import PlayerItems from "../HoveredItem/ItemDescription.jsx";
import "./PlayerCard.css";
import { SummonerSpellIcon } from "../SummonerSpellIcon/SummonerSpellIcon.jsx";
import { ChampionIcon } from "./ProfileIcon.jsx";
import { RunesCell } from "../RunesCell/RunesCell.jsx";
import {
  getCreepScore,
  getKdaClass,
  getMatchRunePage,
  getPlayerMatchStats,
  getProfilePath,
} from "../../service";

// isSearched — карточка Searched player, выделяется в раскрытом матче
export default function PlayerCard({
  player,
  p,
  version,
  currentRegion,
  items,
  teamKills,
  isSearched = false,
}) {
  const targetPlayer = player || p;
  const { kda, kp } = getPlayerMatchStats(targetPlayer, teamKills);
  const profilePath = getProfilePath(
    { name: targetPlayer.riotIdGameName, tag: targetPlayer.riotIdTagline },
    currentRegion,
  );

  const spell1 = targetPlayer.summoner1Id ?? targetPlayer.spell1Id;
  const spell2 = targetPlayer.summoner2Id ?? targetPlayer.spell2Id;

  return (
    <Link
      to={profilePath}
      className={`playerMatchCard${isSearched ? " searched" : ""}`}
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
          cs: {getCreepScore(targetPlayer)}
        </span>
      </div>
      <div className="playerCardRunes">
        <RunesCell
          perks={getMatchRunePage(targetPlayer.perks)}
          variant="inline"
        />
        <span className="playerCardMiniStats">
          <span
            className={getKdaClass(kda)}
            title="KDA: (kills + assists) / deaths"
          >
            {kda === null ? "Perfect" : kda.toFixed(2)} KDA
          </span>
          {" · "}
          <span title="Team kill participation">{kp}%</span>
        </span>
      </div>
    </Link>
  );
}
