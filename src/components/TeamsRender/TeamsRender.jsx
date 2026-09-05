import PlayerCard from "../PlayerCard/PlayerCard";
import { getGameModeLabel } from "../../service";

export function TeamsRender(props) {
  return (
    <div style={{ flexGrow: 1 }}>
      {props.data.matches?.map((match) => {
        const currentPlayer = match.info?.participants?.find(
          (p) => p.puuid === props.data.account?.puuid,
        );
        const isWin = match.info?.teams?.find(
          (t) => t.teamId === currentPlayer?.teamId,
        )?.win;

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
                  ?.filter((p) => p.teamId === 100)
                  .map((p) => (
                    <PlayerCard
                      items={props.data.items}
                      key={p.puuid}
                      p={p}
                      version={props.data.version}
                      currentRegion={props.currentRegion}
                    />
                  ))}
              </div>
              <div className="team">
                {match.info?.participants
                  ?.filter((p) => p.teamId === 200)
                  .map((p) => (
                    <PlayerCard
                      items={props.data.items}
                      key={p.puuid}
                      p={p}
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
