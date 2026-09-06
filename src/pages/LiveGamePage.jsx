import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getLiveGame,
  getGameModeLabel,
  getFormattedName,
  ChampionIcon,
} from "../service";
import "./LiveGamePage.css";

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentRegion, playerName, formattedPlayerName } =
    getFormattedName(playerData);

  useEffect(() => {
    if (formattedPlayerName) {
      document.title = `op.ggv2: ${formattedPlayerName}`;
    }
  }, [formattedPlayerName]);

  useEffect(() => {
    if (!playerData) {
      setLoading(false);
      return;
    }

    async function fetchLiveGame(name) {
      try {
        setLoading(true);
        const result = await getLiveGame(name);
        setLiveData(result);
      } catch (err) {
        console.error("Ошибка при получении Live Game:", err);
        setLiveData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveGame(playerData);
  }, [playerData]);

  function RenderUser({ player }) {
    const rawName = player.riotId || player.summonerName || "Игрок";
    const formattedForUrl = player.riotId
      ? player.riotId.replace("#", "-").replace(/\s/g, "_")
      : player.summonerName;

    const profilePath = formattedForUrl
      ? `/profile/${encodeURIComponent(formattedForUrl)}-${currentRegion}`
      : null;

    const isCurrentPlayer =
      formattedPlayerName &&
      (rawName.toLowerCase() === formattedPlayerName.toLowerCase() ||
        (player.riotId &&
          player.riotId.toLowerCase() === formattedPlayerName.toLowerCase()));

    return (
      <Link
        to={profilePath || "#"}
        className={`liveGamePlayerCard ${isCurrentPlayer ? "currentPlayerCard" : ""}`}
        style={{ textDecoration: "none" }}
      >
        <ChampionIcon
          championId={player.championId}
          size={40}
          className="liveGameChampionIcon"
        />
        <div className="liveGamePlayerInfo">
          <span className="liveGamePlayerName">{rawName}</span>
          {isCurrentPlayer && <span className="currentPlayerBadge">Вы</span>}
        </div>
      </Link>
    );
  }

  function RenderLiveGame({ liveData }) {
    const participants = liveData?.participants || [];
    const blueTeam = participants.filter((p) => p.teamId === 100);
    const redTeam = participants.filter((p) => p.teamId === 200);
    const otherTeams = participants.filter(
      (p) => p.teamId !== 100 && p.teamId !== 200,
    );

    return (
      <div className="matchTeams">
        {blueTeam.length > 0 && (
          <div className="teamFrame blueTeam">
            <div className="teamHeader">
              <h3 className="teamTitle">Синяя команда</h3>
            </div>
            <div className="teamPlayerList">
              {blueTeam.map((player) => (
                <RenderUser
                  key={player.puuid || player.summonerId || player.championId}
                  player={player}
                />
              ))}
            </div>
          </div>
        )}

        {redTeam.length > 0 && (
          <div className="teamFrame redTeam">
            <div className="teamHeader">
              <h3 className="teamTitle">Красная команда</h3>
              <span className="teamCount">{redTeam.length} игр.</span>
            </div>
            <div className="teamPlayerList">
              {redTeam.map((player) => (
                <RenderUser
                  key={player.puuid || player.summonerId || player.championId}
                  player={player}
                />
              ))}
            </div>
          </div>
        )}

        {otherTeams.length > 0 && (
          <div className="teamFrame">
            <div className="teamHeader">
              <h3 className="teamTitle">Другие игроки</h3>
              <span className="teamCount">{otherTeams.length} игр.</span>
            </div>
            <div className="teamPlayerList">
              {otherTeams.map((player) => (
                <RenderUser
                  key={player.puuid || player.summonerId || player.championId}
                  player={player}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  if (loading) {
    return (
      <div className="liveGameContainer">
        <h2>Загрузка текущей игры...</h2>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="liveGameContainer">
        <h2>Игрок сейчас не находится в матче</h2>
        <button onClick={() => navigate(-1)}>Вернуться в профиль</button>
      </div>
    );
  }

  return (
    <div className="liveGameContainer">
      <h1>
        Текущий матч (
        {getGameModeLabel(liveData.gameQueueConfigId, liveData.gameMode)})
      </h1>
      <p>Длительность: {Math.floor(liveData.gameLength / 60)} мин.</p>

      <button
        className="searchbtn"
        onClick={() => navigate(`/profile/${encodeURIComponent(playerData)}`)}
        style={{ marginBottom: "20px" }}
      >
        ← Вернуться в профиль
      </button>
      <RenderLiveGame liveData={liveData}></RenderLiveGame>
    </div>
  );
}
