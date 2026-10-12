import "./LiveGamePage.css";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage } from "../../components";
import { getFormattedName } from "../../service";
import { useRankTheme } from "../../context/RankThemeContext";
import { LiveGameBoard, LiveGameBoardSkeleton } from "./LiveGameBoard.jsx";
import { useLiveGame } from "./useLiveGame.jsx";

// Цвет ранга искомого игрока — только для его строки; всё остальное
// остаётся в стандартном оранжевом --accent
function getTargetRowStyle(color) {
  if (!color) return undefined;
  return {
    "--target-color": color,
    "--target-bg": `${color}1f`,
    "--target-shadow": `${color}40`,
  };
}

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const { currentRegion, formattedPlayerName } = getFormattedName(playerData);
  const { setRankColor } = useRankTheme();
  const { data, loading, refreshing, error, rankColor, refresh, retry } =
    useLiveGame(playerData);

  useEffect(() => {
    if (formattedPlayerName) {
      document.title = `op.ggv2: Live Game — ${formattedPlayerName}`;
    }
  }, [formattedPlayerName]);

  // Фон окрашивается в цвет ранга так же, как на странице профиля
  useEffect(() => {
    setRankColor(rankColor);
    return () => setRankColor(null);
  }, [rankColor, setRankColor]);

  if (!playerData || (error && !data)) {
    return (
      <div className="liveGamePage">
        <ErrorMessage
          error={playerData ? error : { kind: "NOT_FOUND" }}
          onRetry={retry}
        />
      </div>
    );
  }

  // Во время загрузки данные могут остаться от прошлого запроса — не показываем их
  const account = loading ? null : data?.account;
  const game = loading ? null : data?.game;
  const riotId = account
    ? `${account.gameName}#${account.tagLine}`
    : formattedPlayerName;
  const toProfile = () => navigate(`/profile/${encodeURIComponent(playerData)}`);

  return (
    <div className="liveGamePage" style={getTargetRowStyle(rankColor)}>
      {error && <ErrorMessage error={error} onRetry={refresh} />}

      {!loading && !game ? (
        <div className="liveGameEmpty">
          <h2>{riotId} is not in a game right now</h2>
          <p>A live game shows up once champion select is over.</p>
          <div className="liveGameEmptyActions">
            <button className="searchbtn" onClick={retry}>
              Check again
            </button>
            <button className="searchbtn" onClick={toProfile}>
              Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Та же шапка, что на странице профиля */}
          <div className="profileHeaderActions">
            <button className="searchbtn" onClick={toProfile}>
              ← Back to profile
            </button>

            <button
              className="searchbtn refreshBtn"
              onClick={refresh}
              disabled={loading || refreshing}
              title="Fetch the live game again"
            >
              <span className={refreshing ? "spinIcon" : ""}></span>{" "}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {!loading && data?.updatedAt && (
              <span className="updateTimer">
                Updated:{" "}
                {new Date(data.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {loading ? (
            <LiveGameBoardSkeleton />
          ) : (
            <LiveGameBoard data={data} region={currentRegion} />
          )}
        </>
      )}
    </div>
  );
}
