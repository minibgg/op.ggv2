import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLiveGame } from "./service/Utils.js";

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleBackToProfile = () => {
    if (playerData) {
      // Безопасный переход с кодированием спецсимволов
      navigate(`/profile/${encodeURIComponent(playerData)}`);
    } else {
      navigate("/");
    }
  };

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
      <h1>Текущий матч ({liveData.gameMode})</h1>
      <p>Длительность: {Math.floor(liveData.gameLength / 60)} мин.</p>

      <button onClick={handleBackToProfile} style={{ marginBottom: "20px" }}>
        ← Вернуться в профиль
      </button>

      <div className="teamsWrapper">{/* Отрисовка участников матча */}</div>
    </div>
  );
}
