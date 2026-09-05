import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLiveGame, usePlayerData } from "../service";
import { getGameModeLabel, getFormattedName } from "../service";
import { loadPlayer } from "../service";
import "./LiveGamePage.css";

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const { currentRegion, playerName, formattedPlayerName } =
    getFormattedName(playerData);

  const { data, loading, error } = usePlayerData(
    playerData,
    formattedPlayerName,
  );

  useEffect(() => {
    if (data) {
      document.title = `op.ggv2: ${formattedPlayerName}`;
    }
  }, [data, formattedPlayerName]);

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
        <button onClick={handleBackToProfile}>Вернуться в профиль</button>
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
      <div className="matchTeams">
        <div className="team"></div>
      </div>
    </div>
  );
}
