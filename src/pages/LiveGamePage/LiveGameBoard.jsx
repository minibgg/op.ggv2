import { Link } from "react-router-dom";
import {
  ChampionIcon,
  RunesCell,
  SummonerSpellIcon,
} from "../../components";
import { getGameModeLabel } from "../../service";
import { GameTimers } from "./GameTimers.jsx";
import {
  getProfilePath,
  getTeamBans,
  splitRiotId,
  splitTeams,
} from "./liveGameUtils.js";

function BanList({ bans, team, championNames }) {
  return (
    <div className={`liveBans ${team}`}>
      {bans.map((ban) => {
        if (ban.championId <= 0) {
          return (
            <span key={ban.pickTurn} className="liveBan empty" title="No ban" />
          );
        }
        const name = championNames[ban.championId];
        return (
          <span
            key={ban.pickTurn}
            className="liveBan"
            title={name ? `Banned: ${name}` : "Banned"}
          >
            <ChampionIcon championId={ban.championId} name={name} size={28} />
          </span>
        );
      })}
    </div>
  );
}

function PlayerRow({ player, region, championNames, targetPuuid }) {
  const { name, tag } = splitRiotId(player.riotId);
  const championName = championNames[player.championId] || "";
  const displayName = name || championName || "Player";
  const isTarget = Boolean(player.puuid) && player.puuid === targetPuuid;
  // Боты и игроки без Riot ID никуда не ведут
  const isLinked = !player.bot && Boolean(name && tag);

  return (
    <div
      className={`livePlayerRow${isTarget ? " target" : ""}${isLinked ? " linked" : ""}`}
    >
      <ChampionIcon
        championId={player.championId}
        name={championName}
        size={44}
        className="livePlayerChampion"
      />
      <div className="livePlayerSpells">
        <SummonerSpellIcon
          spellId={player.spell1Id}
          size={20}
          className="livePlayerSpell"
        />
        <SummonerSpellIcon
          spellId={player.spell2Id}
          size={20}
          className="livePlayerSpell"
        />
      </div>
      <RunesCell perks={player.perks} />

      <div className="livePlayerText">
        {isLinked ? (
          <Link
            className="livePlayerId livePlayerLink"
            to={getProfilePath({ name, tag }, region)}
            title={`${name}#${tag}`}
          >
            <span className="livePlayerName">{name}</span>
            <span className="livePlayerTag">#{tag}</span>
          </Link>
        ) : (
          <span className="livePlayerId" title={displayName}>
            <span className="livePlayerName">{displayName}</span>
            {player.bot && <span className="livePlayerTag">Bot</span>}
          </span>
        )}
        <span className="livePlayerChampionName">{championName}</span>
      </div>
    </div>
  );
}

function TeamColumn({ team, title, players, ...rowProps }) {
  if (!players.length) return null;

  return (
    <section className={`liveTeam ${team}`}>
      <h3 className="liveTeamTitle">{title}</h3>
      <div className="liveTeamPlayers">
        {players.map((player, i) => (
          <PlayerRow
            key={player.puuid || `${player.championId}-${i}`}
            player={player}
            {...rowProps}
          />
        ))}
      </div>
    </section>
  );
}

export function LiveGameBoard({ data, region }) {
  const { game, account, positions, championNames } = data;
  const { blue, red, others } = splitTeams(game, positions);
  const hasBans = game.bannedChampions?.length > 0;
  const rowProps = { region, championNames, targetPuuid: account.puuid };

  return (
    <div className="liveGameBoard">
      <div className="liveGameStrip">
        {hasBans && (
          <BanList
            bans={getTeamBans(game, 100)}
            team="blue"
            championNames={championNames}
          />
        )}
        <GameTimers
          gameStartTime={game.gameStartTime}
          modeLabel={getGameModeLabel(game.gameQueueConfigId, game.gameMode)}
        />
        {hasBans && (
          <BanList
            bans={getTeamBans(game, 200)}
            team="red"
            championNames={championNames}
          />
        )}
      </div>

      <div className="liveGameTeams">
        <TeamColumn team="blue" title="Blue team" players={blue} {...rowProps} />
        <TeamColumn team="red" title="Red team" players={red} {...rowProps} />
      </div>

      <TeamColumn team="others" title="Other players" players={others} {...rowProps} />
    </div>
  );
}

// Скелетон повторяет раскладку доски, чтобы при загрузке ничего не прыгало
export function LiveGameBoardSkeleton() {
  return (
    <div className="liveGameBoard" aria-busy="true" aria-label="Loading live game">
      <div className="liveGameStrip">
        <div className="liveTimers">
          <span className="liveSkeleton liveSkeletonTimer" />
        </div>
      </div>

      <div className="liveGameTeams">
        {[
          ["blue", "Blue team"],
          ["red", "Red team"],
        ].map(([team, title]) => (
          <section key={team} className={`liveTeam ${team}`}>
            <h3 className="liveTeamTitle">{title}</h3>
            <div className="liveTeamPlayers">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="livePlayerRow liveSkeleton" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
