import PlayerCard from "../PlayerCard/PlayerCard";
import MatchStats from "../MatchStats/MatchStats";
import { getGameModeLabel } from "../../service";
import "./TeamsRender.css";

export function TeamsRender(props) {
  return (
    <div style={{ flexGrow: 1 }}>
      <MatchStats data={props.data} />
      {props.data.matches?.map((match) => {
        const currentPlayer = match.info?.participants?.find(
          (player) => player.puuid === props.data.account?.puuid,
        );
        const isWin =
          match.info?.teams?.find((t) => t.teamId === currentPlayer?.teamId)
            ?.win ?? currentPlayer?.win;

        return (
          <div
            key={match.metadata?.matchId}
            className={`teamframe ${isWin ? "win" : "lose"}`}
            style={{ marginBottom: "10px" }}
          >
            <div className="matchInfo">
              <p className="gameInfo" style={{ marginRight: "10px" }}>
                {new Date(match.info?.gameEndTimestamp).toLocaleDateString()}
              </p>
              <p className="gameInfo" style={{ marginRight: "10px" }}>
                {getGameModeLabel(match.info?.queueId, match.info?.gameMode)}
              </p>
              <p className="gameInfo">
                {Math.floor((match.info?.gameDuration || 0) / 60)}:
                {String((match.info?.gameDuration || 0) % 60).padStart(2, "0")}
              </p>
            </div>

            <div className="matchTeams">
              <div className="team">
                {match.info?.participants
                  ?.filter((player) => player.teamId === 100)
                  .map((player) => (
                    <PlayerCard
                      items={props.data.items}
                      key={player.puuid}
                      player={player}
                      p={player}
                      version={props.data.version}
                      currentRegion={props.currentRegion}
                    />
                  ))}
              </div>
              <div className="team">
                {match.info?.participants
                  ?.filter((player) => player.teamId === 200)
                  .map((player) => (
                    <PlayerCard
                      items={props.data.items}
                      key={player.puuid}
                      player={player}
                      p={player}
                      version={props.data.version}
                      currentRegion={props.currentRegion}
                    />
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
