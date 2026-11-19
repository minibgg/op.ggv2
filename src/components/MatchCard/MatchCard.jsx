import "./MatchCard.css";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import PlayerCard from "../PlayerCard/PlayerCard.jsx";
import PlayerItems from "../HoveredItem/ItemDescription.jsx";
import { ChampionIcon } from "../PlayerCard/ProfileIcon.jsx";
import { RunesCell } from "../RunesCell/RunesCell.jsx";
import { SummonerSpellIcon } from "../SummonerSpellIcon/SummonerSpellIcon.jsx";
import {
  getCreepScore,
  getGameHoursAgo,
  getGameModeLabel,
  getKdaClass,
  getMatchRunePage,
  getPlayerMatchStats,
  getProfilePath,
} from "../../service";

const TEAM_IDS = [100, 200];
const TEAM_NAMES = { 100: "Blue team", 200: "Red team" };
const RESULT_LABELS = { win: "Victory", lose: "Defeat", remake: "Remake" };

// Секунды → "m:ss"
function formatDuration(seconds = 0) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function didTeamWin(match, teamId) {
  const team = match.info.teams?.find((t) => t.teamId === teamId);
  return (
    team?.win ??
    match.info.participants.find((p) => p.teamId === teamId)?.win ??
    false
  );
}

// Ремейк — матч закончился досрочной сдачей в первые минуты,
// победа и поражение в нём не засчитываются
function getResult(match, player) {
  if (player.gameEndedInEarlySurrender) return "remake";
  return didTeamWin(match, player.teamId) ? "win" : "lose";
}

// Один сыгранный матч одной карточкой: чемпион Searched player, заклинания,
// руны, KDA, участие в убийствах, CS, предметы и чемпионы обеих команд.
// Кнопка справа раскрывает подробности — обе команды карточками PlayerCard.
// Пока карточка свёрнута, подробности не рендерятся
export function MatchCard({
  match,
  puuid,
  version,
  items,
  champions,
  currentRegion,
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  const participants = match?.info?.participants || [];
  const player = participants.find((p) => p.puuid === puuid);
  if (!player) return null;

  const { info } = match;
  const result = getResult(match, player);
  const teamOf = (teamId) => participants.filter((p) => p.teamId === teamId);
  const teamKills = (teamId) =>
    teamOf(teamId).reduce((sum, p) => sum + (p.kills || 0), 0);

  const { kda, kp } = getPlayerMatchStats(player, teamKills(player.teamId));
  const cs = getCreepScore(player);
  const minutes = (info.gameDuration || 0) / 60;
  const csPerMinute = minutes > 0 ? (cs / minutes).toFixed(1) : "0.0";

  // Имена чемпионов по числовому id (в DataDragon он лежит в поле key)
  const championNames = {};
  for (const c of Object.values(champions || {})) championNames[c.key] = c.name;

  const endedAt = info.gameEndTimestamp;
  const endedAgo =
    getGameHoursAgo(endedAt) || new Date(endedAt).toLocaleDateString();

  return (
    <div className={`matchCard ${result}${expanded ? " expanded" : ""}`}>
      <div className="matchSummary">
        <div className="matchMeta">
          <p className="matchQueue">
            {getGameModeLabel(info.queueId, info.gameMode)}
          </p>
          <p title={new Date(endedAt).toLocaleString()}>{endedAgo}</p>
          <span className="matchMetaDivider" />
          <p className="matchResult">{RESULT_LABELS[result]}</p>
          <p>{formatDuration(info.gameDuration)}</p>
        </div>

        <div className="matchPlayer">
          <div className="matchPlayerTop">
            <div className="matchChampion">
              <ChampionIcon
                championId={player.championId}
                name={championNames[player.championId] || player.championName}
                title={championNames[player.championId] || player.championName}
                size={48}
                className="matchChampionIcon"
              />
              <span className="matchChampLevel" title="Champion level">
                {player.champLevel}
              </span>
            </div>
            <div className="matchSpells">
              {[player.summoner1Id, player.summoner2Id].map((spellId, i) => (
                <SummonerSpellIcon
                  key={i}
                  spellId={spellId}
                  size={22}
                  version={version}
                  className="matchSpellIcon"
                />
              ))}
            </div>
            <RunesCell
              perks={getMatchRunePage(player.perks)}
              variant="summary"
            />

            <div className="matchKda">
              <p className="matchKdaScore">
                {player.kills} /{" "}
                <span className="matchDeaths">{player.deaths}</span> /{" "}
                {player.assists}
              </p>
              <p
                className={getKdaClass(kda)}
                title="KDA: (kills + assists) / deaths"
              >
                {kda === null ? "Perfect" : `${kda.toFixed(2)}:1`} KDA
              </p>
            </div>

            <div className="matchNumbers">
              <p title="Team kill participation">KP {kp}%</p>
              <p title="Creep score (per minute)">
                CS {cs} ({csPerMinute})
              </p>
              <p title="Damage to champions">
                DMG {(player.totalDamageDealtToChampions || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <PlayerItems player={player} version={version} items={items} />
        </div>

        <div className="matchParticipants">
          {TEAM_IDS.map((teamId) => (
            <ul key={teamId} className="matchParticipantsTeam">
              {teamOf(teamId).map((p) => {
                const name = p.riotIdGameName || p.summonerName || "Unknown";
                const isSearched = p.puuid === puuid;
                const canLink =
                  !isSearched && p.riotIdGameName && p.riotIdTagline;
                return (
                  <li
                    key={p.participantId}
                    className={isSearched ? "searched" : ""}
                  >
                    <ChampionIcon
                      championId={p.championId}
                      name={championNames[p.championId] || p.championName}
                      title={championNames[p.championId] || p.championName}
                      size={16}
                    />
                    {canLink ? (
                      <Link
                        to={getProfilePath(
                          { name: p.riotIdGameName, tag: p.riotIdTagline },
                          currentRegion,
                        )}
                        title={`${p.riotIdGameName}#${p.riotIdTagline}`}
                      >
                        {name}
                      </Link>
                    ) : (
                      <span title={name}>{name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>

        <button
          type="button"
          className="matchExpandBtn"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={expanded ? "Hide match details" : "Show match details"}
          title={expanded ? "Hide match details" : "Show match details"}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="matchExpandArrow" aria-hidden="true">
            ▾
          </span>
        </button>
      </div>

      <div id={detailsId} className="matchDetails" hidden={!expanded}>
        {expanded && (
          <div className="matchTeams">
            {TEAM_IDS.map((teamId) => {
              const won = didTeamWin(match, teamId);
              const outcome =
                result === "remake" ? "remake" : won ? "win" : "lose";
              return (
                <div key={teamId} className="matchTeam">
                  <p className={`matchTeamTitle ${outcome}`}>
                    {RESULT_LABELS[outcome]}{" "}
                    <span className="matchTeamName">
                      · {TEAM_NAMES[teamId]} · {teamKills(teamId)} kills
                    </span>
                  </p>
                  {teamOf(teamId).map((p) => (
                    <PlayerCard
                      key={p.participantId}
                      player={p}
                      items={items}
                      version={version}
                      currentRegion={currentRegion}
                      teamKills={teamKills(teamId)}
                      isSearched={p.puuid === puuid}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchCard;
