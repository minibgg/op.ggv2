import "./LikelyTeammates.css";
import { Link } from "react-router-dom";
import { getLikelyTeammates, getProfilePath, getTimeAgo } from "../../service";
import { SummonerIcon } from "./SummonerIcon.jsx";

const MAX_SHOWN = 5;

// Likely teammates: кто был в одной команде с Searched player в 2+
// загруженных матчах. Считается по уже загруженной истории, поэтому
// список пересчитывается, когда подгружаются ещё матчи («Show N more games»).
// color — цвет SoloQ ранга, как у MostPlayedHeroes; без ранга --accent сайта
export function LikelyTeammates({ matches, puuid, version, region, color }) {
  const loaded = matches?.length ?? 0;
  if (loaded === 0) return null;

  const teammates = getLikelyTeammates(matches, puuid).slice(0, MAX_SHOWN);

  return (
    <section
      className="likelyTeammates"
      style={color ? { "--teammates-accent": color } : undefined}
    >
      <p className="teammatesTitle">Likely teammates:</p>
      <p className="teammatesHint">
        Same team in 2+ of the last {loaded} games
      </p>

      {teammates.length === 0 ? (
        <p className="teammatesEmpty">No repeat teammates in these games.</p>
      ) : (
        <ul className="teammateList">
          {teammates.map((t) => (
            <TeammateRow
              key={t.puuid}
              teammate={t}
              version={version}
              region={region}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TeammateRow({ teammate, version, region }) {
  const { name, tag, games, wins } = teammate;
  const winrate = Math.round((wins / games) * 100);
  const lastPlayed = getTimeAgo(teammate.lastPlayed);

  return (
    <li className="teammateRow">
      <SummonerIcon
        iconId={teammate.profileIcon}
        size={36}
        version={version}
        alt=""
        className="teammateIcon"
      />
      <div className="teammateBody">
        <div className="teammateName">
          {name && tag ? (
            <Link
              to={getProfilePath({ name, tag }, region)}
              title={`${name}#${tag}`}
            >
              {name}
              <span className="teammateTag">#{tag}</span>
            </Link>
          ) : (
            <span>{name || "Unknown"}</span>
          )}
        </div>
        <div className="teammateMeta">
          {games} games · {wins}W {games - wins}L
          {lastPlayed && ` · ${lastPlayed}`}
        </div>
      </div>
      <span
        className={`teammateWinrate ${winrate >= 50 ? "teammateWinrateWin" : "teammateWinrateLose"}`}
        title="Winrate together"
      >
        {winrate}%
      </span>
    </li>
  );
}
