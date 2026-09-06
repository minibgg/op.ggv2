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

  if (!liveData) {
    return (
      <div className="liveGameContainer">
        <h2>Игрок сейчас не находится в матче</h2>
        <button onClick={() => navigate(-1)}>Вернуться в профиль</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="liveGameContainer">
        <h2>Загрузка текущей игры...</h2>
      </div>
    );
  } else {
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
}
