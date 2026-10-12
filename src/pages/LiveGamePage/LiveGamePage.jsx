import "./LiveGamePage.css";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage, LoadStatus, WakeUpNotice } from "../../components";
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
  const {
    data,
    loading,
    refreshing,
    error,
    step,
    startedAt,
    rankColor,
    refresh,
    retry,
  } = useLiveGame(playerData);

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

  if (!playerData) {
    return (
      <div className="liveGamePage">
        <ErrorMessage error={{ kind: "NOT_FOUND" }} />
      </div>
    );
  }

  const toProfile = () => navigate(`/profile/${encodeURIComponent(playerData)}`);

  // Загрузка и её ошибка: панель статуса с шагами, ниже скелетон доски.
  // Шапки нет, пока данные не загрузятся — как на странице профиля
  if (loading || (error && !data)) {
    return (
      <div className="liveGamePage">
        <LoadStatus
          title={error ? "Couldn't load the live game" : "Loading live game"}
          subtitle={formattedPlayerName}
          steps={["Finding account", "Checking for a live game"]}
          current={step}
          error={error}
          wakeUpSince={step === 0 ? startedAt : null}
          onRetry={retry}
          back={{ label: "Back to profile", onClick: toProfile }}
        />
        {!error && <LiveGameBoardSkeleton />}
      </div>
    );
  }

  const { account, game } = data;
  const riotId = `${account.gameName}#${account.tagLine}`;

  return (
    <div className="liveGamePage" style={getTargetRowStyle(rankColor)}>
      {error && <ErrorMessage error={error} onRetry={refresh} />}

      {!game ? (
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
              disabled={refreshing}
              title="Fetch the live game again"
            >
              <span className={refreshing ? "spinIcon" : ""}></span>{" "}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <WakeUpNotice since={refreshing ? startedAt : null} compact />

            {data.updatedAt && (
              <span className="updateTimer">
                Updated:{" "}
                {new Date(data.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <LiveGameBoard data={data} region={currentRegion} />
        </>
      )}
    </div>
  );
}
